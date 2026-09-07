'use client';

import type { ReactNode } from 'react';

import { ME_LABEL, VIZ_HER, VIZ_ME } from '@/constants/messageStats';
import { formatDuration, formatHour, formatMonth, formatRatio, shareOf } from '@/utils/messageStats';
import type { MessageStats } from '@/types/us';
import { BarList } from '@/components/us/messages/BarList';
import { Card } from '@/components/us/messages/Card';
import { DataTable } from '@/components/us/messages/DataTable';
import { GroupedBars } from '@/components/us/messages/GroupedBars';
import { Heatmap } from '@/components/us/messages/Heatmap';
import { Legend } from '@/components/us/messages/Legend';
import { LineChart } from '@/components/us/messages/LineChart';
import { SplitBarList } from '@/components/us/messages/SplitBarList';
import { StatTile } from '@/components/us/messages/StatTile';
import { TooltipLayer, TooltipRow } from '@/components/us/messages/TooltipLayer';

interface MessagesDashboardProps {
  stats: MessageStats;
}

const count = (value: number) => value.toLocaleString('en-US');

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const shortDate = (isoDate: string) =>
  new Date(`${isoDate}T12:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

const Chip = ({ children }: { children: ReactNode }) => (
  <span className="rounded-md bg-neutral-700/40 px-2.5 py-1.5 text-xs text-neutral-300">{children}</span>
);

export const MessagesDashboard = ({ stats }: MessagesDashboardProps) => {
  const herKey = stats.meta.contact;
  const herLabel = herKey.split(' ')[0];
  const legendItems = [
    { color: VIZ_ME, label: ME_LABEL },
    { color: VIZ_HER, label: herLabel }
  ];

  const { meta, totals, streaks, latency, emoji_stats: emojiStats, attachments } = stats;
  const mePercent = shareOf(totals.me, totals.her);
  const lastMonth = stats.by_month[stats.by_month.length - 1];

  return (
    <TooltipLayer>
      <header className="mb-6">
        <h1 className="font-oswald text-3xl uppercase tracking-wide text-white">
          {ME_LABEL} &amp; {herLabel}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          <b className="font-medium text-white">{count(meta.real_messages)}</b> messages ·{' '}
          <b className="font-medium text-white">{longDate(meta.first_message)}</b> →{' '}
          <b className="font-medium text-white">{longDate(meta.last_message)}</b> · {count(meta.days_span)} days
        </p>
      </header>

      <div className="mb-3.5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatTile value={count(meta.real_messages)} label="Messages" detail={`${streaks.avg_per_active_day} per active day`} />
        <StatTile value={count(meta.days_span)} label="Days talking" detail={`${count(streaks.active_days)} with at least one message`} />
        <StatTile
          value={`${streaks.longest_days} days`}
          label="Longest streak"
          detail={`unbroken, ended ${shortDate(streaks.streak_ended)}`}
        />
        <StatTile
          value={String(streaks.silent_days)}
          label="Days of silence"
          detail={`longest gap was ${streaks.longest_gap_days} days`}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-12">
        <Card title="Who talks more" note="Messages sent, and total words written." className="lg:col-span-6">
          <div className="mb-2.5 flex h-8 gap-0.5 overflow-hidden rounded-md">
            <div
              className="flex items-center rounded-l-md px-2.5 text-xs font-medium text-white"
              style={{ background: VIZ_ME, flexGrow: totals.me }}
            >
              {ME_LABEL} {mePercent}%
            </div>
            <div
              className="flex items-center justify-end rounded-r-md px-2.5 text-xs font-medium text-white"
              style={{ background: VIZ_HER, flexGrow: totals.her }}
            >
              {100 - mePercent}% {herLabel}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip>
              {ME_LABEL} <b className="text-white">{count(totals.words_me)}</b> words
            </Chip>
            <Chip>
              {herLabel} <b className="text-white">{count(totals.words_her)}</b> words
            </Chip>
            <Chip>
              {ME_LABEL}&apos;s median message <b className="text-white">{stats.length.me.median} chars</b>
            </Chip>
            <Chip>
              {herLabel}&apos;s <b className="text-white">{stats.length[herKey].median} chars</b>
            </Chip>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-neutral-500">
            {herLabel} sends more messages; {ME_LABEL} writes more words — his messages run longer (mean{' '}
            {stats.length.me.mean} vs {stats.length[herKey].mean} characters). {ME_LABEL} opens{' '}
            {count(stats.starts.me)} conversations after a six-hour lull to {herLabel}&apos;s {count(stats.starts[herKey])}.
          </p>
        </Card>

        <Card
          title="Reply speed"
          note="Time to answer the other person, capped at 12 hours. Tapbacks excluded."
          className="lg:col-span-6"
        >
          <Legend items={legendItems} />
          <div className="mb-4 flex flex-wrap gap-1.5">
            <Chip>
              {ME_LABEL} median <b className="text-white">{formatDuration(latency.me.median_sec)}</b>
            </Chip>
            <Chip>
              {herLabel} median <b className="text-white">{formatDuration(latency[herKey].median_sec)}</b>
            </Chip>
            <Chip>
              {ME_LABEL} middle 50%{' '}
              <b className="text-white">
                {formatDuration(latency.me.p25_sec)}–{formatDuration(latency.me.p75_sec)}
              </b>
            </Chip>
            <Chip>
              {herLabel}{' '}
              <b className="text-white">
                {formatDuration(latency[herKey].p25_sec)}–{formatDuration(latency[herKey].p75_sec)}
              </b>
            </Chip>
          </div>
          <GroupedBars
            rows={latency.me.buckets.map((bucket, index) => ({
              label: bucket.label,
              me: bucket.count,
              her: latency[herKey].buckets[index]?.count ?? 0
            }))}
            meColor={VIZ_ME}
            herColor={VIZ_HER}
            herLabel={herLabel}
          />
          <DataTable
            headers={['Reply within', ME_LABEL, herLabel]}
            rows={latency.me.buckets.map((bucket, index) => [
              bucket.label,
              bucket.count,
              latency[herKey].buckets[index]?.count ?? 0
            ])}
          />
        </Card>

        <Card title="Messages per month" className="lg:col-span-12">
          <Legend items={legendItems} />
          <LineChart
            points={stats.by_month}
            meColor={VIZ_ME}
            herColor={VIZ_HER}
            meLabel={ME_LABEL}
            herLabel={herLabel}
            partialLast
          />
          <p className="mt-2 text-xs text-neutral-500">
            The final point is a partial month — the data ends {longDate(meta.last_message)}, so{' '}
            {formatMonth(lastMonth.month)} covers only part of it. It is drawn hollow and dashed.
          </p>
          <DataTable
            headers={['Month', ME_LABEL, herLabel, 'Total']}
            rows={stats.by_month.map(point => [point.month, point.me, point.her, point.me + point.her])}
          />
        </Card>

        <Card
          title="When you talk"
          note="Messages by day of week and hour of day, local time."
          className="lg:col-span-8"
        >
          <Heatmap cells={stats.heatmap} />
        </Card>

        <Card title="Peak hours" note="Share of all messages by hour." className="lg:col-span-4">
          <Legend items={legendItems} />
          <GroupedBars
            rows={Array.from({ length: 8 }, (_, block) => {
              const start = block * 3;
              const sum = (series: number[]) => series.slice(start, start + 3).reduce((a, b) => a + b, 0);
              return {
                label: `${formatHour(start)}–${formatHour((start + 3) % 24)}`,
                me: sum(stats.by_hour.me),
                her: sum(stats.by_hour[herKey])
              };
            })}
            meColor={VIZ_ME}
            herColor={VIZ_HER}
            herLabel={herLabel}
          />
        </Card>

        <Card
          title="Most-used words"
          note="Common English stop words removed. URLs stripped, tapbacks excluded."
          className="lg:col-span-12"
        >
          <Legend items={legendItems} />
          <div className="grid gap-x-8 gap-y-1.5 md:grid-cols-2">
            <BarList items={stats.words.me.slice(0, 20).map(([label, value]) => ({ label, value }))} color={VIZ_ME} />
            <BarList
              items={stats.words[herKey].slice(0, 20).map(([label, value]) => ({ label, value }))}
              color={VIZ_HER}
            />
          </div>
        </Card>

        <Card
          title="Distinctive words"
          note="Words one of you uses far more than the other, by rate per 10,000 words written. Bar length is that person's own use; the figure is how much more often they say it. Minimum 40 uses combined."
          className="lg:col-span-6"
        >
          <Legend items={legendItems} />
          <div className="grid gap-x-8 gap-y-1.5 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs text-neutral-500">More {ME_LABEL}</p>
              <BarList
                color={VIZ_ME}
                items={stats.distinctive.me.slice(0, 10).map(word => ({
                  label: word.word,
                  value: word.me,
                  display: formatRatio(word.ratio),
                  tooltip: (
                    <>
                      <TooltipRow color={VIZ_ME} label={ME_LABEL} value={count(word.me)} />
                      <TooltipRow color={VIZ_HER} label={herLabel} value={count(word.her)} />
                      <TooltipRow label="Rate difference" value={formatRatio(word.ratio)} />
                    </>
                  )
                }))}
              />
            </div>
            <div>
              <p className="mb-2 text-xs text-neutral-500">More {herLabel}</p>
              <BarList
                color={VIZ_HER}
                items={stats.distinctive.her.slice(0, 10).map(word => ({
                  label: word.word,
                  value: word.her,
                  display: formatRatio(1 / word.ratio),
                  tooltip: (
                    <>
                      <TooltipRow color={VIZ_ME} label={ME_LABEL} value={count(word.me)} />
                      <TooltipRow color={VIZ_HER} label={herLabel} value={count(word.her)} />
                      <TooltipRow label="Rate difference" value={formatRatio(1 / word.ratio)} />
                    </>
                  )
                }))}
              />
            </div>
          </div>
        </Card>

        <Card title="Shared vocabulary" note="Words you both lean on. Bars split by who said it." className="lg:col-span-6">
          <Legend items={legendItems} />
          <SplitBarList
            meColor={VIZ_ME}
            herColor={VIZ_HER}
            herLabel={herLabel}
            items={stats.shared_words.slice(0, 12).map(word => ({ label: word.word, me: word.me, her: word.her }))}
          />
        </Card>

        <Card
          title="Most-used emoji"
          note={`Wordle and Connections share grids are filtered out (${emojiStats.game_grids.me + emojiStats.game_grids[herKey]} of them).`}
          className="lg:col-span-12"
        >
          <Legend items={legendItems} />
          <div className="mb-4 flex flex-wrap gap-1.5">
            <Chip>
              {herLabel} sent <b className="text-white">{count(emojiStats.total[herKey])}</b> emoji
            </Chip>
            <Chip>
              {ME_LABEL} sent <b className="text-white">{count(emojiStats.total.me)}</b>
            </Chip>
            <Chip>
              {ME_LABEL}&apos;s range is wider: <b className="text-white">{emojiStats.distinct.me}</b> distinct vs{' '}
              <b className="text-white">{emojiStats.distinct[herKey]}</b>
            </Chip>
          </div>
          <div className="grid gap-x-8 gap-y-1.5 md:grid-cols-2">
            <BarList
              emoji
              valueLabel="Sent"
              color={VIZ_ME}
              items={stats.emoji.me.slice(0, 12).map(([label, value]) => ({ label, value }))}
            />
            <BarList
              emoji
              valueLabel="Sent"
              color={VIZ_HER}
              items={stats.emoji[herKey].slice(0, 12).map(([label, value]) => ({ label, value }))}
            />
          </div>
        </Card>

        <Card title="Things you say" note="Messages containing each phrase." className="lg:col-span-6">
          <Legend items={legendItems} />
          <GroupedBars
            rows={stats.phrase_order
              .filter(phrase => stats.phrases.me[phrase] || stats.phrases[herKey][phrase])
              .map(phrase => ({
                label: phrase,
                me: stats.phrases.me[phrase] ?? 0,
                her: stats.phrases[herKey][phrase] ?? 0
              }))}
            meColor={VIZ_ME}
            herColor={VIZ_HER}
            herLabel={herLabel}
          />
        </Card>

        <Card
          title="Tapbacks"
          note={`${count(meta.reactions)} reactions sent, on top of the message counts.`}
          className="lg:col-span-6"
        >
          <Legend items={legendItems} />
          <GroupedBars
            rows={stats.reactions.map(reaction => ({ label: reaction.kind, me: reaction.me, her: reaction.her }))}
            meColor={VIZ_ME}
            herColor={VIZ_HER}
            herLabel={herLabel}
          />
        </Card>

        <Card
          title="Message length over time"
          note="Mean characters per message, by month. URLs stripped."
          className="lg:col-span-6"
        >
          <Legend items={legendItems} />
          <LineChart
            points={stats.length_by_month}
            meColor={VIZ_ME}
            herColor={VIZ_HER}
            meLabel={ME_LABEL}
            herLabel={herLabel}
            width={520}
            height={250}
            formatValue={value => `${Math.round(value)}`}
            partialLast
          />
          <DataTable
            headers={['Month', ME_LABEL, herLabel]}
            rows={stats.length_by_month.map(point => [point.month, point.me, point.her])}
          />
        </Card>

        <Card title="Links, photos, big days" className="lg:col-span-6">
          <p className="mb-2 text-xs text-neutral-500">Most-shared domains</p>
          <BarList
            color={VIZ_ME}
            valueLabel="Links shared"
            items={stats.domains.slice(0, 8).map(([label, value]) => ({ label, value }))}
          />
          <p className="mt-5 mb-2 text-xs text-neutral-500">Busiest days</p>
          <BarList
            color={VIZ_ME}
            valueLabel="Messages"
            items={streaks.busiest_days.map(day => ({ label: shortDate(day.date), value: day.count }))}
          />
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Chip>{count(attachments.total)} attachments</Chip>
            <Chip>{count(attachments.by_type.find(([type]) => type === 'image')?.[1] ?? 0)} photos</Chip>
            <Chip>{count(attachments.by_type.find(([type]) => type === 'video')?.[1] ?? 0)} videos</Chip>
            <Chip>
              {ME_LABEL} {count(attachments.by_sender.me)} / {herLabel} {count(attachments.by_sender[herKey])}
            </Chip>
          </div>
        </Card>
      </div>

      <footer className="mt-8 text-xs leading-relaxed text-neutral-500">
        Aggregated from a local iMessage export on {longDate(meta.generated_at)} — 1:1 threads only, group chats
        excluded. {count(meta.message_count)} rows total, of which {count(meta.real_messages)} are messages and{' '}
        {count(meta.reactions)} are tapbacks. Word and emoji counts exclude tapbacks, system events and URLs. Counts
        only — no message text is stored or served.
      </footer>
    </TooltipLayer>
  );
};
