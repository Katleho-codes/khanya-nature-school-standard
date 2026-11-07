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
import { branchTone, toneStyle } from "@/lib/tones";

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
    <section aria-labelledby="calendar-heading" className="paper-card bg-paper p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="sticker bg-sun-tint text-ink">Month by month</p>
          <h2 id="calendar-heading" className="display-md mt-2 text-ink">
            {formatMonth(`${month}-15T12:00:00+02:00`)}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth((current) => monthOffset(current, -1))}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink/15 bg-paper text-ink transition-colors hover:border-ink hover:bg-sky-tint"
            aria-label="Show previous month"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={() => setMonth(nowMonth)}
            className="inline-flex min-h-12 items-center rounded-full border-2 border-ink/15 bg-paper px-4 text-[0.78rem] font-bold text-ink transition-colors hover:border-ink hover:bg-sun-tint"
          >
            This month
          </button>
          <button
            type="button"
            onClick={() => setMonth((current) => monthOffset(current, 1))}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink/15 bg-paper text-ink transition-colors hover:border-ink hover:bg-sky-tint"
            aria-label="Show next month"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[24px_18px_26px_16px] border-2 border-ink/10 bg-paper">
        <div className="grid grid-cols-7 bg-sun-tint">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-1 py-2 text-center text-[0.62rem] font-extrabold uppercase tracking-[0.06em] text-ink/75 sm:text-[0.68rem]"
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
                className={`min-h-[4.4rem] border-b border-r border-ink/10 p-1 sm:min-h-[7rem] sm:p-2 ${
                  cell.current ? "bg-paper" : "bg-paper/60"
                } ${(index + 1) % 7 === 0 ? "border-r-0" : ""}`}
              >
                {cell.current ? (
                  <>
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.72rem] font-bold ${
                        dayEvents.length > 0
                          ? "bg-poppy-deep text-white"
                          : "text-ink/75"
                      }`}
                    >
                      {cell.day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.slug}`}
                          className={`block truncate rounded-[8px] px-1.5 py-1 text-[0.62rem] font-semibold leading-tight text-ink transition-transform hover:-rotate-[1deg] sm:text-[0.7rem] ${toneStyle(branchTone(event.branch?.slug ?? event.branch?.name)).pill}`}
                          title={event.title}
                        >
                          {event.title}
                        </Link>
                      ))}
                      {dayEvents.length > 2 ? (
                        <span className="block px-1 text-[0.6rem] font-semibold text-ink/75">
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
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-[1.45rem] font-extrabold text-ink">
            {monthEvents.length === 0
              ? "Nothing on this month"
              : `${monthEvents.length} ${monthEvents.length === 1 ? "event" : "events"}`}
          </h3>
          <span className="hand text-[1.02rem] text-ink/75">
            {formatMonth(`${month}-15T12:00:00+02:00`)}
          </span>
        </div>

        {monthEvents.length === 0 ? (
          <div className="mt-4 paper-card-plain bg-sun-tint/50 p-5">
            <p className="max-w-xl text-sm leading-relaxed text-ink/75">
              The garden is quiet this month. Try the next month, or send us a
              message if you would like to arrange a visit.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setMonth((current) => monthOffset(current, 1))}
                className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-ink"
              >
                Look at the next month
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {monthEvents.map((event) => {
              const day = southAfricaDay(event.startsAt).day;
              const tone = toneStyle(branchTone(event.branch?.slug ?? event.branch?.name));
              return (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.slug}`}
                    className="group grid gap-3 paper-card-plain bg-paper p-4 transition-transform hover:-rotate-[0.4deg] sm:grid-cols-[6rem_1fr_auto] sm:items-baseline sm:gap-6"
                  >
                    <div className={`rounded-[14px] ${tone.tint} px-2 py-1 text-center`}>
                      <p className="font-display text-[1.7rem] font-extrabold leading-none text-ink">
                        {day}
                      </p>
                      <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-ink/75">
                        {formatDateLong(event.startsAt).split(",")[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.06em] text-ink/75">
                        {event.allDay
                          ? "All day"
                          : `${formatTime(event.startsAt)} to ${formatTime(event.endsAt)}`}
                        {event.branch ? ` · ${event.branch.name}` : " · All branches"}
                      </p>
                      <h4 className="mt-1 font-display text-[1.28rem] font-extrabold leading-tight text-ink transition-colors group-hover:text-poppy-deep">
                        {event.title}
                      </h4>
                      <p className="mt-1 text-[0.8rem] text-ink/75">
                        {event.locationText}
                      </p>
                    </div>
                    <ArrowRightIcon className="hidden h-5 w-5 text-ink transition-transform duration-300 group-hover:translate-x-1 sm:block" />
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
