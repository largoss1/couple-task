import { getUserFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { generateGeminiResponse, parseTaskCreationIntent } from "@/lib/gemini";
import {
  createTask,
  getUserLists,
  parseDate,
  parseTime,
} from "@/lib/taskHelper";

/**
 * Extract task details from user message using AI
 */
async function extractTaskDetails(userMessage, systemContext) {
  const extractionPrompt = `${systemContext}

Analyze this user message and extract task details. If the user wants to create a task, respond with ONLY a JSON object (no markdown, no explanation):

{
  "action": "create_task",
  "title": "task title here",
  "description": "optional description",
  "dueDate": "today/tomorrow/YYYY-MM-DD or null",
  "dueTime": "HH:MM or morning/afternoon/evening or null",
  "priority": 1-4 (1=low, 2=normal, 3=high, 4=urgent)
}

If the user is NOT asking to create a task, respond with:
{
  "action": "chat"
}

User message: "${userMessage}"

JSON Response:`;

  const result = await generateGeminiResponse(extractionPrompt, "");

  try {
    // Try to extract JSON from response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", e);
  }

  return { action: "chat" };
}

/**
 * POST: Chat with AI Assistant (with task creation)
 */
export async function POST(request) {
  try {
    // Authenticate user
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { message, context } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get user's lists
    const lists = await getUserLists(user.id);
    const listNames = lists.map((l) => l.name).join(", ");

    // Build system context
    const systemContext = `You are a helpful AI assistant for a couple's schedule management application.

Your capabilities:
- Answer questions about task management
- Analyze user messages to understand if they want to create tasks
- Help organize schedules and suggest priorities

Current user: ${user.email}
${
  context
    ? `User's tasks: ${context.tasksCount} total, ${context.upcomingTasks} upcoming, ${context.completedTasks} completed`
    : ""
}
${lists.length > 0 ? `Available lists: ${listNames}` : ""}

Be conversational and helpful. When users ask to create tasks, acknowledge and help them.`;

    // Step 1: Detect if user wants to create a task
    const taskIntent = await extractTaskDetails(message, systemContext);

    console.log("📋 Task Intent:", taskIntent);

    // Step 2: If task creation intent, create the task
    if (taskIntent.action === "create_task" && taskIntent.title) {
      try {
        // Parse dates and times
        const dueDate = parseDate(taskIntent.dueDate);
        const dueTime = parseTime(taskIntent.dueTime);

        // Find list by name if specified
        let listId = null;
        if (taskIntent.listName) {
          const list = lists.find(
            (l) => l.name.toLowerCase() === taskIntent.listName.toLowerCase()
          );
          if (list) {
            listId = list.id;
          }
        }

        // Create task
        const task = await createTask(user.id, {
          title: taskIntent.title,
          description: taskIntent.description || null,
          dueDate: dueDate,
          dueTime: dueTime,
          priority: taskIntent.priority || 2,
          listId: listId,
          tags: [],
        });

        console.log("✅ Task created:", task);

        // Generate friendly response
        const confirmationPrompt = `User asked: "${message}"

I successfully created a task:
- Title: ${task.title}
${task.due_date ? `- Due date: ${task.due_date}` : ""}
${task.due_time ? `- Time: ${task.due_time}` : ""}
- Priority: ${task.priority}/4

Write a brief, friendly confirmation message (1-2 sentences). Be enthusiastic and encouraging.`;

        const confirmation = await generateGeminiResponse(
          confirmationPrompt,
          ""
        );

        return NextResponse.json({
          message: confirmation.text,
          taskCreated: {
            id: task.id,
            title: task.title,
            dueDate: task.due_date,
            dueTime: task.due_time,
            priority: task.priority,
          },
          usage: confirmation.usage,
        });
      } catch (error) {
        console.error("❌ Task creation error:", error);

        return NextResponse.json({
          message: `I understood you want to create a task, but encountered an error: ${error.message}. Could you try again with more details?`,
          error: error.message,
        });
      }
    }

    // Step 3: Normal chat response (no task creation)
    const chatPrompt = `${systemContext}\n\nUser: ${message}\n\nProvide a helpful, concise response (2-3 sentences max). Be friendly and actionable.`;

    const result = await generateGeminiResponse(chatPrompt, "");

    return NextResponse.json({
      message: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error("AI assistant error:", error);

    return NextResponse.json(
      {
        error: "AI service is temporarily unavailable. Please try again.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 503 }
    );
  }
}

/**
 * GET: Generate task suggestions (unchanged)
 */
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tasksParam = searchParams.get("tasks");
    const tasks = tasksParam ? JSON.parse(tasksParam) : [];

    if (tasks.length === 0) {
      return NextResponse.json({
        suggestions:
          "You don't have any upcoming tasks at the moment. Great job staying on top of things! 🎉\n\nConsider:\n1. Planning tasks for the upcoming week\n2. Setting personal or couple goals\n3. Scheduling quality time together",
      });
    }

    const taskSummary = tasks
      .slice(0, 10)
      .map((task, index) => {
        const parts = [`${index + 1}. "${task.title}"`];
        if (task.due_date) parts.push(`Due: ${task.due_date}`);
        if (task.priority && task.priority > 1)
          parts.push(`Priority: ${task.priority}/4`);
        return parts.join(" | ");
      })
      .join("\n");

    const systemContext = `You are a productivity assistant. Analyze the task list and provide 3-5 specific, actionable suggestions for better time management. Use a numbered list format.`;

    const userMessage = `Here are my upcoming tasks:\n\n${taskSummary}\n\nTotal: ${
      tasks.length
    } task${
      tasks.length === 1 ? "" : "s"
    }\n\nGive me specific suggestions to manage these effectively.`;

    const result = await generateGeminiResponse(userMessage, systemContext);

    return NextResponse.json({
      suggestions: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error("AI suggestions error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate suggestions.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
