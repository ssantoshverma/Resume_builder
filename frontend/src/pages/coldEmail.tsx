import React, { useState } from "react";

export default function ScheduleEmailForm() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert HH:mm to UTC ISO timestamp
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);

    // If time already passed today, schedule for tomorrow
    if (now < new Date()) {
      now.setDate(now.getDate() + 1);
    }

    const payload = {
      to,
      subject,
      body,
      schedule: now.toISOString()
    };

    console.log("Sending payload:", payload);

    const response = await fetch(
      "http://localhost:5000/api/cold-email/schedule",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();
    alert("Scheduled: " + JSON.stringify(result));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-md mx-auto">
      <input
        type="email"
        placeholder="Recipient Email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        required
        className="border p-2 w-full"
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="border p-2 w-full"
      />
      <textarea
        placeholder="Email body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
        className="border p-2 w-full"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Schedule Email
      </button>
    </form>
  );
}
