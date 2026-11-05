"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Event } from "@/lib/types";
import {
  formatDateLong,
  formatMonth,
  formatTime,
  monthKey,
  monthKeyFromParts,
  parseMonthKey,
} from "@/lib/format";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "./icons";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function southAfricaDay(value: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date(value));
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function monthOffset(key: string, amount: number): string {
  const { year, month } = parseMonthKey(key);
  const date = new Date(Date.UTC(year, month - 1 + amount, 1));
  return monthKeyFromParts(date.getUTCFullYear(), date.getUTCMonth() + 1);
}

export function EventsCalendar({
  events,
  initialMonth,
}: {
  events: Event[];
  initialMonth: string;
}) {
  const [month, setMonth] = useState(initialMonth);
  const { year, month: monthNumber } = parseMonthKey(month);

  const monthEvents = useMemo(
    () =>
      events
        .filter((event) => {
          const date = southAfricaDay(event.startsAt);
          return (
            date.year === year &&
            date.month === monthNumber
          );
        })
        .sort(
          (left, right) =>
            new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
        ),
    [events, monthNumber, year],
  );

  const byDay = useMemo(() => {
    const map = new Map<number, Event[]>();
    for (const event of monthEvents) {
      const day = southAfricaDay(event.startsAt).day;
      const list = map.get(day) ?? [];
      list.push(event);
      map.set(day, list);
    }
    return map;
  }, [monthEvents]);

  const firstWeekday = (new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const cells: Array<{ day: number; current: boolean }> = [];
  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push({ day: 0, current: false });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, current: true });
  }
  while (cells.length % 7 !== 0) cells.push({ day: 0, current: false });

  const nowMonth = monthKey(new Date());

  return (
    <section aria-labelledby="calendar-heading" className="border-t border-line pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps text-sage-deep">Month by month</p>
          <h2 id="calendar-heading" className="display-md mt-2 text-forest">
            {formatMonth(`${month}-15T12:00:00+02:00`)}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth((current) => monthOffset(current, -1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong text-forest transition-colors hover:bg-forest-tint"
            aria-label="Show previous month"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={() => setMonth(nowMonth)}
            className="rounded-sm border border-line-strong px-3.5 py-2 text-[0.78rem] text-forest transition-colors hover:bg-forest-tint"
          >
            This month
          </button>
          <button
            type="button"
            onClick={() => setMonth((current) => monthOffset(current, 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong text-forest transition-colors hover:bg-forest-tint"
            aria-label="Show next month"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-line bg-paper">
        <div className="grid grid-cols-7 border-b border-line bg-sage-tint/55">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-1 py-2 text-center text-[0.62rem] font-medium uppercase tracking-[0.1em] text-sage-deep sm:text-[0.68rem]"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, index) => {
            const dayEvents = cell.current ? byDay.get(cell.day) ?? [] : [];
            return (
              <div
                key={`${cell.day}-${index}`}
                className={`min-h-[4.2rem] border-b border-r border-line p-1 sm:min-h-[7rem] sm:p-2 ${
                  cell.current ? "bg-paper" : "bg-oat/65"
                } ${(index + 1) % 7 === 0 ? "border-r-0" : ""}`}
              >
                {cell.current ? (
                  <>
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.72rem] ${
                        dayEvents.length > 0
                          ? "bg-forest text-oat"
                          : "text-bark-soft"
                      }`}
                    >
                      {cell.day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.slug}`}
                          className="block truncate rounded-sm bg-sage-tint px-1.5 py-1 text-[0.62rem] leading-tight text-forest transition-colors hover:bg-forest-tint sm:text-[0.7rem]"
                          title={event.title}
                        >
                          {event.title}
                        </Link>
                      ))}
                      {dayEvents.length > 2 ? (
                        <span className="block px-1 text-[0.6rem] text-bark-soft">
                          +{dayEvents.length - 2} more
                        </span>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <h3 className="font-display text-[1.45rem] text-forest">
            {monthEvents.length === 0
              ? "Nothing on this month"
              : `${monthEvents.length} ${monthEvents.length === 1 ? "event" : "events"}`}
          </h3>
          <span className="text-[0.72rem] uppercase tracking-[0.14em] text-sage-deep">
            {formatMonth(`${month}-15T12:00:00+02:00`)}
          </span>
        </div>

        {monthEvents.length === 0 ? (
          <div className="py-8">
            <p className="max-w-xl text-sm leading-relaxed text-bark-soft">
              The garden is quiet this month. Try the next month, or send us a
              message if you would like to arrange a visit.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setMonth((current) => monthOffset(current, 1))}
                className="inline-flex items-center gap-1.5 text-sm text-forest underline decoration-ochre decoration-2 underline-offset-4"
              >
                Look at the next month
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {monthEvents.map((event) => {
              const day = southAfricaDay(event.startsAt).day;
              return (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.slug}`}
                    className="group grid gap-3 py-5 transition-colors hover:bg-paper/70 sm:grid-cols-[6rem_1fr_auto] sm:items-baseline sm:gap-6"
                  >
                    <div>
                      <p className="font-display text-[1.7rem] leading-none text-forest">
                        {day}
                      </p>
                      <p className="mt-1 text-[0.68rem] uppercase tracking-[0.13em] text-sage-deep">
                        {formatDateLong(event.startsAt).split(",")[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-sage-deep">
                        {event.allDay
                          ? "All day"
                          : `${formatTime(event.startsAt)} to ${formatTime(event.endsAt)}`}
                        {event.branch ? ` · ${event.branch.name}` : " · All branches"}
                      </p>
                      <h4 className="mt-1 font-display text-[1.28rem] leading-tight text-forest transition-colors group-hover:text-sage-deep">
                        {event.title}
                      </h4>
                      <p className="mt-1 text-[0.8rem] text-bark-soft">
                        {event.locationText}
                      </p>
                    </div>
                    <ArrowRightIcon className="hidden h-5 w-5 text-forest transition-transform duration-300 group-hover:translate-x-1 sm:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
