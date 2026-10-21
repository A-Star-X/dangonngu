"use client";
// @spec T4-01, T4-02, T4-03, T4-04, T4-05, T4-06, T4-07, T4-08, T4-09
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  RANGES,
  completedSessions,
  dailyCounts,
  dayEndOf,
  displayStatus,
  endOfDay,
  hasCompletedSession,
  itemsLearned,
  parseRange,
  rangeDays,
  rangeStats,
  reviewSchedule,
  sessionResults,
  sessionsInLast7Days,
  startOfDay,
  LEARN_STATUS_TONE,
  type LanguageData,
  type Progress,
  type RangeDays,
  type Session,
} from "@/domain";
import { Strip, type CellState } from "@/components/learning/strip";
import { DataWithStatus } from "@/components/status/data-with-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardCustom } from "@/components/ui/card-custom";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { useSheet } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLearningData } from "@/hooks/use-learning-data";
import { useNav } from "@/hooks/use-nav";
import { useRoute } from "@/hooks/use-route";
import { cn } from "@/lib/utils";
import {
  formatDayTitle,
  formatSessionTime,
  formatWeekdayShort,
} from "@/utils/format-date";
import { formatCount } from "@/utils/format-number";
import { useLearning } from "@/providers/learning-provider";

const PAGE = 20;

export function TienDoView() {
  const t = useTranslations("t4");
  const locale = useLocale();
  const { params } = useRoute();
  const app = useLearningData();
  const sheet = useSheet();
  const nav = useNav();
  const [limit, setLimit] = useState(PAGE);
  if (!app) return null;
  const { d, progress, deps, settings } = app;
  const now = deps.now();
  const k = parseRange(params.khoang);
  const valid = (id: number) => d.byId.has(id);

  const head = (
    <PageHeader
      title={t("title")}
      description={t("description")}
      actions={
        <Segmented
          label={t("rangeLabel")}
          value={String(k) as `${RangeDays}`}
          onChange={(r) => {
            setLimit(PAGE);
            nav("tien-do", { khoang: r }, { replace: true });
          }}
          options={RANGES.map((r) => ({
            value: String(r) as `${RangeDays}`,
            label: t("range", { count: r }),
          }))}
        />
      }
    />
  );

  // T4-08: chưa có phiên nào.
  if (!hasCompletedSession(progress)) {
    return (
      <section className="flex flex-col gap-4">
        {head}
        <CardCustom className="flex flex-col items-start gap-4 sm:p-6">
          <p className="text-data">{t("empty")}</p>
          <Button
            tone="primary"
            onClick={() => nav("phien-hoc", { nguon: "lo-trinh" })}
          >
            {t("emptyAction")}
          </Button>
        </CardCustom>
      </section>
    );
  }

  const stats = rangeStats(progress, now, k, valid);
  const done = sessionsInLast7Days(progress, now);
  const goal = settings.weeklyGoal;
  const reached = done >= goal;
  const schedule = reviewSchedule(progress, now, valid);
  const days = rangeDays(now, k);
  const sessions = completedSessions(progress, days[0], endOfDay(now));

  const openDay = (day: number) => {
    sheet.open({
      title: formatDayTitle(day, locale),
      body: () => <DayDetail d={d} day={day} />,
    });
  };

  const stat = (label: string, value: number, testId: string) => (
    <div className="flex min-w-0 flex-col-reverse justify-end gap-1 px-3 py-4 sm:px-4">
      <dt className="text-description">{label}</dt>
      <dd className="num text-2xl font-bold" data-testid={testId}>
        {formatCount(value, locale)}
      </dd>
    </div>
  );

  return (
    <section className="flex flex-col gap-4">
      {head}
      {/* T4-02: ba số liệu cạnh nhau trong một khối, ngăn bằng đường kẻ (FND-13: không tách mỗi số một thẻ). */}
      <CardCustom className="p-0">
        <dl className="grid grid-cols-3 divide-x divide-border">
          {stat(t("statSessions"), stats.sessions, "t4-sessions")}
          {stat(t("statItems"), stats.items, "t4-items")}
          {stat(t("statDue"), stats.dueToday, "t4-due")}
        </dl>
      </CardCustom>

      {/* T4-09: từ lg các khối xếp lưới hai cột tự xuống hàng. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Mục tiêu tuần và lịch ôn tập cùng kiểu khối (tiêu đề section rồi panel), hai panel cao bằng nhau từ lg. */}
        <section
          className="flex flex-col gap-3"
          aria-labelledby="t4-goal-title"
        >
          <SectionTitle id="t4-goal-title">{t("goal")}</SectionTitle>
          <CardCustom className="flex flex-1 flex-col justify-center gap-3">
            <p className="num text-2xl font-bold" data-testid="t4-goal">
              {t("goalValue", { done, goal })}
            </p>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label={t("goal")}
              aria-valuemin={0}
              aria-valuemax={goal}
              aria-valuenow={Math.min(done, goal)}
              aria-valuetext={t("goalValue", { done, goal })}
              data-reached={reached || undefined}
            >
              <span
                className={cn(
                  "block h-full rounded-full",
                  reached ? "bg-success" : "bg-foreground",
                )}
                style={{ width: `${Math.min(100, (done / goal) * 100)}%` }}
              />
            </div>
          </CardCustom>
        </section>

        <section className="flex flex-col gap-3" aria-labelledby="t4-schedule">
          <SectionTitle id="t4-schedule">{t("schedule")}</SectionTitle>
          <CardCustom className="flex-1 py-1">
            <dl className="flex flex-col divide-y divide-border">
              {(
                [
                  ["today", schedule.today, "t4-today"],
                  ["tomorrow", schedule.tomorrow, "t4-tomorrow"],
                  ["next7", schedule.next7, "t4-next7"],
                ] as const
              ).map(([key, n, id]) => (
                <div key={key} className="flex justify-between gap-3 py-3">
                  <dt className="text-data">{t(`when.${key}`)}</dt>
                  <dd className="num text-data font-semibold" data-testid={id}>
                    {t("itemsCount", { count: formatCount(n, locale) })}
                  </dd>
                </div>
              ))}
            </dl>
          </CardCustom>
        </section>

        {k > 1 && (
          <Chart
            k={k}
            now={now}
            progress={progress}
            valid={valid}
            onOpenDay={openDay}
          />
        )}

        {sessions.length > 0 && (
          <section
            className="flex min-w-0 flex-col gap-3 lg:col-span-2"
            aria-labelledby="t4-sessions-title"
          >
            <SectionTitle id="t4-sessions-title">{t("sessions")}</SectionTitle>
            <SessionTable
              sessions={sessions.slice(0, limit)}
              progress={progress}
              now={now}
            />
            {sessions.length > limit && (
              <Button
                tone="outline"
                className="self-start"
                onClick={() => setLimit(limit + PAGE)}
              >
                {t("more")}
              </Button>
            )}
          </section>
        )}
      </div>
    </section>
  );
}

/** T4-04: biểu đồ cột và bảng số liệu tương đương cho trình đọc màn hình. */
function Chart({
  k,
  now,
  progress,
  valid,
  onOpenDay,
}: {
  k: RangeDays;
  now: number;
  progress: Progress;
  valid: (id: number) => boolean;
  onOpenDay: (day: number) => void;
}) {
  const t = useTranslations("t4");
  const locale = useLocale();
  const counts = dailyCounts(progress, now, k, valid);
  const max = Math.max(1, ...counts.map((c) => c.count));
  const today = startOfDay(now);
  const label = (day: number, i: number) => {
    if (k === 7) return formatWeekdayShort(day, locale);
    return (k - 1 - i) % 5 === 0 ? String(new Date(day).getDate()) : "";
  };
  return (
    <section
      className="flex min-w-0 flex-col gap-3 lg:col-span-2"
      aria-labelledby="t4-chart"
    >
      <SectionTitle id="t4-chart">{t("chart")}</SectionTitle>
      <CardCustom>
        <div
          className={cn(
            "grid auto-cols-fr grid-flow-col items-end",
            k === 7 ? "gap-3" : "gap-1",
          )}
          data-testid="t4-chart"
        >
          {counts.map((c, i) => {
            const isToday = c.day === today;
            return (
              <div
                key={c.day}
                className="flex min-w-0 flex-col items-stretch gap-1"
                data-testid="t4-col"
              >
                <div className="flex h-32 items-end justify-center">
                  {c.count > 0 ? (
                    <button
                      type="button"
                      className="group flex h-full w-full items-end justify-center rounded-dropdown"
                      aria-label={t("bar", {
                        day: formatDayTitle(c.day, locale),
                        count: c.count,
                      })}
                      onClick={() => onOpenDay(c.day)}
                      data-today={isToday || undefined}
                    >
                      <span
                        className={cn(
                          "block min-h-1 w-full max-w-8 rounded-t-dropdown",
                          isToday
                            ? "bg-primary"
                            : "bg-foreground/60 group-hover:bg-foreground/80",
                        )}
                        style={{ height: `${(c.count / max) * 100}%` }}
                      />
                    </button>
                  ) : (
                    <span
                      className="mb-1 size-1 rounded-full bg-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span
                  className="num min-h-5 text-center text-sm whitespace-nowrap text-muted-foreground"
                  aria-hidden="true"
                >
                  {label(c.day, i)}
                </span>
              </div>
            );
          })}
        </div>
      </CardCustom>
      <div className="sr-only" data-testid="t4-table">
        <Table scroll={false}>
          <caption>{t("chart")}</caption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">{t("day")}</TableHead>
              <TableHead scope="col">{t("count")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {counts.map((c) => (
              <TableRow key={c.day}>
                <TableHead scope="row">
                  {formatDayTitle(c.day, locale)}
                </TableHead>
                <TableCell>{c.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function cellsOf(progress: Progress, s: Session): CellState[] {
  const r = sessionResults(progress, s);
  return s.itemIds.map((id) => {
    const x = r.perItem.get(id);
    return x === "nho" ? "nho" : x === "can-on" ? "can-on" : "chua";
  });
}

/** T4-06: bảng phiên học: giờ, nguồn, kết quả từng câu. */
function SessionTable({
  sessions,
  progress,
  now,
}: {
  sessions: Session[];
  progress: Progress;
  now: number;
}) {
  const t = useTranslations("t4");
  const tn = useTranslations("nguon");
  const locale = useLocale();
  return (
    <CardCustom className="px-0 py-1">
      <DataWithStatus isEmpty={sessions.length === 0}>
        <Table data-testid="t4-session-list">
          <TableHeader>
            <TableRow>
              <TableHead>{t("colTime")}</TableHead>
              {/* Màn hẹp: cách học hiện dưới giờ trong cột đầu, để cột Kết quả (dải 8 ô) không bị cắt. */}
              <TableHead className="hidden sm:table-cell">
                {t("colSource")}
              </TableHead>
              <TableHead className="text-right">{t("colResult")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((s) => (
              <TableRow key={s.id} data-testid="t4-session">
                <TableCell className="whitespace-nowrap">
                  <span className="num block text-muted-foreground">
                    {formatSessionTime(s.completedAt!, now, locale)}
                  </span>
                  <span className="block sm:hidden">{tn(s.nguon)}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {tn(s.nguon)}
                </TableCell>
                <TableCell className="text-right">
                  <Strip cells={cellsOf(progress, s)} className="justify-end" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataWithStatus>
    </CardCustom>
  );
}

/** T4-07: chi tiết một ngày. */
function DayDetail({ d, day }: { d: LanguageData; day: number }) {
  const t = useTranslations("t4");
  const ts = useTranslations("status");
  const locale = useLocale();
  const { progress, deps } = useLearning();
  const now = deps.now();
  const sessions = completedSessions(progress, day, dayEndOf(day));
  const ids = itemsLearned(progress, day, dayEndOf(day), (id) =>
    d.byId.has(id),
  );
  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>{t("sessions")}</SectionTitle>
      <SessionTable sessions={sessions} progress={progress} now={now} />
      <SectionTitle>
        {t("dayItems", { count: formatCount(ids.length, locale) })}
      </SectionTitle>
      <ul className="divide-y divide-border" data-testid="t4-day-items">
        {ids.map((id) => {
          const it = d.byId.get(id)!;
          const st = displayStatus(progress.items[id], now);
          return (
            <li
              key={id}
              className="flex items-start justify-between gap-3 py-2"
            >
              <span className="src text-data" lang={d.lang}>
                {it.en}
              </span>
              <Badge tone={LEARN_STATUS_TONE[st]}>{ts(st)}</Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
