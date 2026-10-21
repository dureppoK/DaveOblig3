
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import FullCalendar from "@fullcalendar/react";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import type {
  DateClickInfo,
  EventClickInfo,
} from "@fullcalendar/react/public-api";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Plus,
  Share2,
  Trash2,
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  date: string;
  completed: boolean;
};

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date: string) {
  if (!date) return "Choose a date";

  // Use a local midday date to avoid UTC date shifts.
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

export default function CalendarTodo() {
  const hydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const [today] = useState(() =>
    typeof window === "undefined" ? "" : getLocalDate()
  );
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (!today) return [];

    return [
      {
        id: "1",
        title: "Plan the project",
        date: today,
        completed: true,
      },
      {
        id: "2",
        title: "Design the calendar interface",
        date: today,
        completed: false,
      },
      {
        id: "3",
        title: "Set up Supabase",
        date: getLocalDate(new Date(Date.now() + 86400000)),
        completed: false,
      },
    ];
  });
  const [selectedDate, setSelectedDate] = useState(today);
  const [title, setTitle] = useState("");
  const [taskDate, setTaskDate] = useState(today);
  const [showForm, setShowForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const selectedTasks = useMemo(
    () => tasks.filter((task) => task.date === selectedDate),
    [tasks, selectedDate]
  );

  const completedCount = selectedTasks.filter(
    (task) => task.completed
  ).length;

  const events = useMemo(
    () =>
      tasks.map((task) => ({
        id: task.id,
        title: `${task.completed ? "✓ " : ""}${task.title}`,
        start: task.date,
        allDay: true,
        backgroundColor: task.completed ? "#dcfce7" : "#dbeafe",
        borderColor: task.completed ? "#86efac" : "#93c5fd",
        textColor: task.completed ? "#166534" : "#1d4ed8",
      })),
    [tasks]
  );

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle || !taskDate) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      date: taskDate,
      completed: false,
    };

    setTasks((current) => [...current, newTask]);
    setSelectedDate(taskDate);
    setTitle("");
    setShowForm(false);
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function deleteTask(id: string) {
    setTasks((current) =>
      current.filter((task) => task.id !== id)
    );
  }

  function handleDateClick(info: DateClickInfo) {
    setSelectedDate(info.dateStr.slice(0, 10));
    setTaskDate(info.dateStr.slice(0, 10));
  }

  function handleEventClick(info: EventClickInfo) {
    if (info.event.startStr) {
      setSelectedDate(info.event.startStr.slice(0, 10));
    }
    toggleTask(info.event.id);
  }

  function openTaskForm() {
    setTaskDate(selectedDate || getLocalDate());
    setShowForm(true);
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="mt-6 h-32 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white">
              <CalendarDays size={23} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Daylist
              </h1>
              <p className="text-sm text-slate-500">
                Your time, your tasks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              alert("Sharing will be added with Supabase.")
            }
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            <Share2 size={17} />
            Share
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-blue-600">
                YOUR SCHEDULE
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                My tasks
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Choose a date to see what you need to do.
              </p>
            </div>

            <button
              type="button"
              onClick={openTaskForm}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={19} />
              New task
            </button>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <label
                htmlFor="selected-date"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Select day
              </label>
              <input
                id="selected-date"
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.target.value);
                  setTaskDate(event.target.value);
                }}
                className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:max-w-sm"
              />
              <p className="mt-2 text-sm text-slate-500">
                {formatDate(selectedDate)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const today = getLocalDate();
                setSelectedDate(today);
                setTaskDate(today);
              }}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50"
            >
              Go to today
            </button>
          </div>
        </section>

        {showForm && (
          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold">Create a task</h3>

            <form
              onSubmit={addTask}
              className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px_auto]"
            >
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-2 block text-sm font-medium"
                >
                  Task name
                </label>
                <input
                  id="task-title"
                  autoFocus
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Finish the assignment"
                  maxLength={200}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="task-date"
                  className="mb-2 block text-sm font-medium"
                >
                  Due date
                </label>
                <input
                  id="task-date"
                  type="date"
                  value={taskDate}
                  onChange={(event) => setTaskDate(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Add task
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">
                {selectedDate === getLocalDate()
                  ? "Today's tasks"
                  : "Tasks for this day"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedTasks.length}{" "}
                {selectedTasks.length === 1 ? "task" : "tasks"} ·{" "}
                {completedCount} completed
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCalendar((value) => !value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              {showCalendar ? "Hide calendar" : "Show calendar"}
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {selectedTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
                <CalendarDays
                  size={30}
                  className="mx-auto text-slate-400"
                />
                <p className="mt-3 font-semibold">
                  Nothing planned for this day
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add a task to start organizing your day.
                </p>
                <button
                  type="button"
                  onClick={openTaskForm}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Add your first task
                </button>
              </div>
            ) : (
              selectedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-label={
                      task.completed
                        ? "Mark task incomplete"
                        : "Mark task complete"
                    }
                    className="shrink-0 text-blue-600"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={22} />
                    ) : (
                      <Circle size={22} />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`break-words font-medium ${
                        task.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-800"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {task.completed ? "Completed" : "To do"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.title}`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {showCalendar && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h3 className="mb-5 text-xl font-bold">Calendar overview</h3>
            <div className="calendar-wrapper">
              <FullCalendar
                plugins={[
                  classicThemePlugin,
                  dayGridPlugin,
                  interactionPlugin,
                ]}
                initialView="dayGridMonth"
                initialDate={selectedDate || undefined}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "",
                }}
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                dayCellClass={(info) => {
                  const now = new Date();
                  const weekStart = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() - ((now.getDay() + 6) % 7)
                  );
                  const nextWeek = new Date(weekStart);
                  nextWeek.setDate(weekStart.getDate() + 7);

                  return info.date >= weekStart && info.date < nextWeek
                    ? "fc-current-week"
                    : undefined;
                }}
                height="auto"
                dayMaxEvents={3}
                firstDay={1}
              />
            </div>
          </section>
        )}

        <p className="text-center text-xs text-slate-500">
          Prototype only · Tasks reset when you refresh the page.
          Database storage and sharing are not connected yet.
        </p>
      </div>
    </main>
  );
}
