"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Course, ScheduleRow, Teacher } from "@/lib/types";
import BackButton from "@/components/BackButton";
import ImageUpload from "@/components/ImageUpload";

type Tab = "teachers" | "courses" | "schedule";

export default function AdminDashboard({
  initialTeachers,
  initialCourses,
  initialSchedule,
}: {
  initialTeachers: Teacher[];
  initialCourses: Course[];
  initialSchedule: ScheduleRow[];
}) {
  const [tab, setTab] = useState<Tab>("teachers");
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  // Public site updates instantly: every mutation calls router.refresh(),
  // which re-runs the server components (home/courses/timetable/teachers)
  // on next request — no separate publish step.
  const refresh = () => router.refresh();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <BackButton label="Back to site" fallbackHref="/" />
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
        <h1 className="font-display font-bold text-2xl sm:text-3xl">Admin dashboard</h1>
        <button onClick={signOut} className="text-sm text-paper/50 hover:text-paper transition shrink-0">
          Sign out
        </button>
      </div>

      <div className="flex gap-2 mb-6 sm:mb-8 border-b border-white/10 overflow-x-auto">
        {([
          ["teachers", "Teachers"],
          ["courses", "Courses"],
          ["schedule", "Schedule"],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm font-display font-bold border-b-2 -mb-px transition whitespace-nowrap ${
              tab === id ? "border-accent text-paper" : "border-transparent text-paper/40 hover:text-paper/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "teachers" && <TeachersTab teachers={initialTeachers} onChange={refresh} />}
      {tab === "courses" && <CoursesTab courses={initialCourses} onChange={refresh} />}
      {tab === "schedule" && (
        <ScheduleTab schedule={initialSchedule} courses={initialCourses} teachers={initialTeachers} onChange={refresh} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Teachers
function TeachersTab({ teachers, onChange }: { teachers: Teacher[]; onChange: () => void }) {
  const supabase = createClient();
  const empty = { name: "", bio: "", email: "", phone: "", photo_url: "" };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (editingId) {
      await supabase.from("teachers").update(form).eq("id", editingId);
    } else {
      await supabase.from("teachers").insert(form);
    }
    setBusy(false);
    setForm(empty);
    setEditingId(null);
    onChange();
  }

  async function remove(id: string) {
    if (!confirm("Delete this teacher?")) return;
    await supabase.from("teachers").delete().eq("id", id);
    onChange();
  }

  function edit(t: Teacher) {
    setEditingId(t.id);
    setForm({ name: t.name, bio: t.bio, email: t.email, phone: t.phone, photo_url: t.photo_url || "" });
  }

  return (
    <div className="grid md:grid-cols-[1fr_380px] gap-8">
      <div className="card divide-y divide-white/10">
        {teachers.map((t) => (
          <div key={t.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {t.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.photo_url} alt="" className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-medium truncate">{t.name}</p>
                <p className="text-paper/40 text-xs mt-0.5 truncate">{t.email} {t.phone && `· ${t.phone}`}</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs shrink-0">
              <button onClick={() => edit(t)} className="text-accent hover:underline">Edit</button>
              <button onClick={() => remove(t.id)} className="text-red-400 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {!teachers.length && <p className="p-4 text-paper/40 text-sm">No teachers yet.</p>}
      </div>

      <form onSubmit={save} className="card p-5 space-y-3 h-fit">
        <h3 className="font-display font-bold text-sm mb-1">{editingId ? "Edit teacher" : "Add teacher"}</h3>
        <ImageUpload
          label="Photo"
          folder="teachers"
          round
          value={form.photo_url}
          onChange={(url) => setForm({ ...form, photo_url: url })}
        />
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} textarea />
        <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <div className="flex gap-2 pt-1">
          <button disabled={busy} className="bg-accent text-ink font-display font-bold text-sm rounded-lg px-4 py-2 disabled:opacity-50">
            {editingId ? "Save changes" : "Add teacher"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="text-sm text-paper/50">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------- Courses
function CoursesTab({ courses, onChange }: { courses: Course[]; onChange: () => void }) {
  const supabase = createClient();
  const empty = { name: "", description: "", fee: 0, duration: "", color: "#6366F1", photo_url: "" };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (editingId) {
      await supabase.from("courses").update(form).eq("id", editingId);
    } else {
      await supabase.from("courses").insert(form);
    }
    setBusy(false);
    setForm(empty);
    setEditingId(null);
    onChange();
  }

  async function remove(id: string) {
    if (!confirm("Delete this course? Its schedule slots will be removed too.")) return;
    await supabase.from("courses").delete().eq("id", id);
    onChange();
  }

  function edit(c: Course) {
    setEditingId(c.id);
    setForm({ name: c.name, description: c.description, fee: c.fee, duration: c.duration, color: c.color, photo_url: c.photo_url || "" });
  }

  return (
    <div className="grid md:grid-cols-[1fr_380px] gap-8">
      <div className="card divide-y divide-white/10">
        {courses.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {c.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.photo_url} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0" />
              ) : (
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />
              )}
              <div className="min-w-0">
                <p className="font-medium truncate">{c.name}</p>
                <p className="text-paper/40 text-xs mt-0.5">{c.duration} {c.fee > 0 && `· Rs. ${c.fee}`}</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs shrink-0">
              <button onClick={() => edit(c)} className="text-accent hover:underline">Edit</button>
              <button onClick={() => remove(c.id)} className="text-red-400 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {!courses.length && <p className="p-4 text-paper/40 text-sm">No courses yet.</p>}
      </div>

      <form onSubmit={save} className="card p-5 space-y-3 h-fit">
        <h3 className="font-display font-bold text-sm mb-1">{editingId ? "Edit course" : "Add course"}</h3>
        <ImageUpload
          label="Photo"
          folder="courses"
          value={form.photo_url}
          onChange={(url) => setForm({ ...form, photo_url: url })}
        />
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
        <Field label="Duration" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} placeholder="e.g. 2 hrs / session" />
        <div>
          <label className="text-xs text-paper/50 block mb-1">Fee (Rs.)</label>
          <input
            type="number"
            value={form.fee}
            onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })}
            className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-xs text-paper/50 block mb-1">Chip color</label>
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-full h-9 bg-ink border border-white/10 rounded-lg"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button disabled={busy} className="bg-accent text-ink font-display font-bold text-sm rounded-lg px-4 py-2 disabled:opacity-50">
            {editingId ? "Save changes" : "Add course"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="text-sm text-paper/50">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- Schedule
function ScheduleTab({
  schedule,
  courses,
  teachers,
  onChange,
}: {
  schedule: ScheduleRow[];
  courses: Course[];
  teachers: Teacher[];
  onChange: () => void;
}) {
  const supabase = createClient();
  const empty = {
    course_id: courses[0]?.id ?? "",
    teacher_id: teachers[0]?.id ?? "",
    lab: "Lab-1",
    day_label: "(Sat, Sun)",
    start_time: "09:00",
    end_time: "11:00",
    batch: "A",
  };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (editingId) {
      await supabase.from("schedule").update(form).eq("id", editingId);
    } else {
      await supabase.from("schedule").insert(form);
    }
    setBusy(false);
    setForm(empty);
    setEditingId(null);
    onChange();
  }

  async function remove(id: string) {
    if (!confirm("Remove this slot?")) return;
    await supabase.from("schedule").delete().eq("id", id);
    onChange();
  }

  function edit(s: ScheduleRow) {
    setEditingId(s.id);
    setForm({
      course_id: s.course_id,
      teacher_id: s.teacher_id,
      lab: s.lab,
      day_label: s.day_label,
      start_time: s.start_time,
      end_time: s.end_time,
      batch: s.batch,
    });
  }

  return (
    <div className="grid md:grid-cols-[1fr_380px] gap-8">
      <div className="card divide-y divide-white/10">
        {schedule.map((s) => (
          <div key={s.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium truncate">{s.courses?.name} ({s.batch})</p>
              <p className="text-paper/40 text-xs mt-0.5">
                {s.teachers?.name} · {s.lab} · {s.day_label} {s.start_time}–{s.end_time}
              </p>
            </div>
            <div className="flex gap-3 text-xs shrink-0">
              <button onClick={() => edit(s)} className="text-accent hover:underline">Edit</button>
              <button onClick={() => remove(s.id)} className="text-red-400 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {!schedule.length && <p className="p-4 text-paper/40 text-sm">No schedule slots yet.</p>}
      </div>

      <form onSubmit={save} className="card p-5 space-y-3 h-fit">
        <h3 className="font-display font-bold text-sm mb-1">{editingId ? "Edit slot" : "Add slot"}</h3>

        <div>
          <label className="text-xs text-paper/50 block mb-1">Course</label>
          <select
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-paper/50 block mb-1">Teacher</label>
          <select
            value={form.teacher_id}
            onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
            className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-paper/50 block mb-1">Lab</label>
            <select
              value={form.lab}
              onChange={(e) => setForm({ ...form, lab: e.target.value })}
              className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {["Lab-1", "Lab-2", "Lab-3"].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-paper/50 block mb-1">Batch</label>
            <select
              value={form.batch}
              onChange={(e) => setForm({ ...form, batch: e.target.value })}
              className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {["A", "B"].map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <Field label="Day label" value={form.day_label} onChange={(v) => setForm({ ...form, day_label: v })} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-paper/50 block mb-1">Start</label>
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-paper/50 block mb-1">End</label>
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button disabled={busy || !courses.length || !teachers.length} className="bg-accent text-ink font-display font-bold text-sm rounded-lg px-4 py-2 disabled:opacity-50">
            {editingId ? "Save changes" : "Add slot"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="text-sm text-paper/50">
              Cancel
            </button>
          )}
        </div>
        {(!courses.length || !teachers.length) && (
          <p className="text-xs text-paper/40">Add at least one course and one teacher first.</p>
        )}
      </form>
    </div>
  );
}

// ------------------------------------------------------------------ Field
function Field({
  label,
  value,
  onChange,
  textarea,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-paper/50 block mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none"
        />
      ) : (
        <input
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        />
      )}
    </div>
  );
}
