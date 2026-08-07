"use client";

import { useState } from "react";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Two series of the SAME measure (sessions), so one axis serves both. */
const organic = [
  12400, 13100, 14800, 15200, 16900, 18300, 19100, 21400, 23800, 25100, 27600, 29800,
];
const referral = [4200, 4600, 5100, 6300, 6800, 7200, 8900, 9400, 10200, 11800, 12400, 13900];
const revenue = [18.2, 21.4, 24.1, 23.6, 28.3, 31.0, 33.4, 38.1, 41.5, 44.2, 49.7, 54.2];

const seriesMeta = [
  { key: "organic", label: "Organic search", color: "var(--series-1)", data: organic },
  { key: "referral", label: "Referral", color: "var(--series-2)", data: referral },
] as const;

function formatK(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
}

/* ---------------------------------------------------------------- line chart */

const LW = 720;
const LH = 280;
const PAD = { top: 20, right: 78, bottom: 34, left: 48 };
const plotW = LW - PAD.left - PAD.right;
const plotH = LH - PAD.top - PAD.bottom;

const yMax = 32000;
const yTicks = [0, 8000, 16000, 24000, 32000];

const xAt = (index: number) => PAD.left + (index / (months.length - 1)) * plotW;
const yAt = (value: number) => PAD.top + plotH - (value / yMax) * plotH;

const linePath = (data: readonly number[]) =>
  data.map((value, index) => `${index === 0 ? "M" : "L"}${xAt(index)},${yAt(value)}`).join(" ");

export function TrafficChart() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <figure className="m-0">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="font-semibold tracking-tight">Sessions by channel</h3>
          <p className="text-ink-3 mt-1 text-sm">Last 12 months</p>
        </div>
        {/* Legend — identity is never carried by colour alone */}
        <ul className="flex gap-4">
          {seriesMeta.map((series) => (
            <li key={series.key} className="text-ink-2 flex items-center gap-2 text-sm">
              <span
                aria-hidden
                className="size-2.5 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              {series.label}
            </li>
          ))}
        </ul>
      </figcaption>

      <div className="relative mt-5" onMouseLeave={() => setActive(null)}>
        <svg
          viewBox={`0 0 ${LW} ${LH}`}
          className="w-full"
          role="img"
          aria-label="Line chart of monthly sessions from organic search and referral over the last 12 months. Both channels grow steadily; organic search rises from 12.4k to 29.8k and referral from 4.2k to 13.9k."
        >
          {/* Recessive gridlines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={PAD.left + plotW}
                y1={yAt(tick)}
                y2={yAt(tick)}
                stroke="var(--line)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 10}
                y={yAt(tick) + 4}
                textAnchor="end"
                className="fill-[var(--ink-3)] text-[11px] tabular-nums"
              >
                {formatK(tick)}
              </text>
            </g>
          ))}

          {/* X labels */}
          {months.map((month, index) => (
            <text
              key={month}
              x={xAt(index)}
              y={LH - 12}
              textAnchor="middle"
              className="fill-[var(--ink-3)] text-[11px]"
            >
              {month}
            </text>
          ))}

          {/* Series lines — 2px, no fill under them */}
          {seriesMeta.map((series) => (
            <path
              key={series.key}
              d={linePath(series.data)}
              fill="none"
              stroke={series.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Direct labels at the line ends */}
          {seriesMeta.map((series) => (
            <text
              key={series.key}
              x={xAt(months.length - 1) + 10}
              y={yAt(series.data[months.length - 1]) + 4}
              className="fill-[var(--ink-2)] text-[11px] font-medium tabular-nums"
            >
              {formatK(series.data[months.length - 1])}
            </text>
          ))}

          {/* Crosshair + markers on hover */}
          {active !== null && (
            <g>
              <line
                x1={xAt(active)}
                x2={xAt(active)}
                y1={PAD.top}
                y2={PAD.top + plotH}
                stroke="var(--line-strong)"
                strokeWidth={1}
              />
              {seriesMeta.map((series) => (
                <circle
                  key={series.key}
                  cx={xAt(active)}
                  cy={yAt(series.data[active])}
                  r={5}
                  fill={series.color}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}

          {/* Invisible hit targets, wider than the marks */}
          {months.map((month, index) => (
            <rect
              key={month}
              x={xAt(index) - plotW / (months.length - 1) / 2}
              y={PAD.top}
              width={plotW / (months.length - 1)}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setActive(index)}
            />
          ))}
        </svg>

        {active !== null && (
          <div
            className="border-line bg-surface pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${(xAt(active) / LW) * 100}%`,
              top: 0,
            }}
          >
            <p className="font-semibold">{months[active]}</p>
            {seriesMeta.map((series) => (
              <p key={series.key} className="mt-1 flex items-center gap-2 whitespace-nowrap">
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ backgroundColor: series.color }}
                />
                <span className="text-ink-2">{series.label}</span>
                <span className="ml-auto font-medium tabular-nums">
                  {series.data[active].toLocaleString()}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
    </figure>
  );
}

/* ----------------------------------------------------------------- bar chart */

const BW = 720;
const BH = 240;
const BPAD = { top: 20, right: 12, bottom: 34, left: 48 };
const bPlotW = BW - BPAD.left - BPAD.right;
const bPlotH = BH - BPAD.top - BPAD.bottom;
const rMax = 60;
const rTicks = [0, 20, 40, 60];

/** Bar with a 4px rounded top, square where it meets the baseline. */
function barPath(x: number, y: number, w: number, h: number, r = 4) {
  const radius = Math.min(r, w / 2, h);
  return [
    `M${x},${y + h}`,
    `L${x},${y + radius}`,
    `Q${x},${y} ${x + radius},${y}`,
    `L${x + w - radius},${y}`,
    `Q${x + w},${y} ${x + w},${y + radius}`,
    `L${x + w},${y + h}`,
    "Z",
  ].join(" ");
}

export function RevenueChart() {
  const [active, setActive] = useState<number | null>(null);

  const slot = bPlotW / months.length;
  const barW = slot - 8; // 8px keeps a clear surface gap between adjacent bars

  return (
    <figure className="m-0">
      {/* Single series — the title names it, so no legend box is needed */}
      <figcaption>
        <h3 className="font-semibold tracking-tight">Monthly recurring revenue</h3>
        <p className="text-ink-3 mt-1 text-sm">Thousands of USD, last 12 months</p>
      </figcaption>

      <div className="relative mt-5" onMouseLeave={() => setActive(null)}>
        <svg
          viewBox={`0 0 ${BW} ${BH}`}
          className="w-full"
          role="img"
          aria-label="Bar chart of monthly recurring revenue over the last 12 months, growing from $18.2k in January to $54.2k in December."
        >
          {rTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={BPAD.left}
                x2={BPAD.left + bPlotW}
                y1={BPAD.top + bPlotH - (tick / rMax) * bPlotH}
                y2={BPAD.top + bPlotH - (tick / rMax) * bPlotH}
                stroke={tick === 0 ? "var(--line-strong)" : "var(--line)"}
                strokeWidth={1}
              />
              <text
                x={BPAD.left - 10}
                y={BPAD.top + bPlotH - (tick / rMax) * bPlotH + 4}
                textAnchor="end"
                className="fill-[var(--ink-3)] text-[11px] tabular-nums"
              >
                ${tick}k
              </text>
            </g>
          ))}

          {revenue.map((value, index) => {
            const h = (value / rMax) * bPlotH;
            const x = BPAD.left + index * slot + 4;
            const y = BPAD.top + bPlotH - h;
            return (
              <g key={months[index]}>
                <path
                  d={barPath(x, y, barW, h)}
                  fill="var(--series-1)"
                  opacity={active === null || active === index ? 1 : 0.45}
                />
                <text
                  x={x + barW / 2}
                  y={BH - 12}
                  textAnchor="middle"
                  className="fill-[var(--ink-3)] text-[11px]"
                >
                  {months[index]}
                </text>
                <rect
                  x={BPAD.left + index * slot}
                  y={BPAD.top}
                  width={slot}
                  height={bPlotH}
                  fill="transparent"
                  onMouseEnter={() => setActive(index)}
                />
              </g>
            );
          })}
        </svg>

        {active !== null && (
          <div
            className="border-line bg-surface pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border px-3 py-2 text-xs whitespace-nowrap shadow-lg"
            style={{
              left: `${((BPAD.left + active * slot + slot / 2) / BW) * 100}%`,
              top: 0,
            }}
          >
            <p className="font-semibold">{months[active]}</p>
            <p className="text-ink-2 mt-0.5 tabular-nums">${revenue[active].toFixed(1)}k MRR</p>
          </div>
        )}
      </div>
    </figure>
  );
}

/* ------------------------------------------------- table view (a11y fallback) */

export function DataTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-sm">
        <caption className="sr-only">Monthly sessions by channel and recurring revenue</caption>
        <thead>
          <tr className="border-line border-b text-left">
            <th scope="col" className="text-ink-2 py-2.5 pr-4 font-medium">
              Month
            </th>
            <th scope="col" className="text-ink-2 py-2.5 pr-4 text-right font-medium">
              Organic
            </th>
            <th scope="col" className="text-ink-2 py-2.5 pr-4 text-right font-medium">
              Referral
            </th>
            <th scope="col" className="text-ink-2 py-2.5 text-right font-medium">
              MRR
            </th>
          </tr>
        </thead>
        <tbody>
          {months.map((month, index) => (
            <tr key={month} className="border-line border-b last:border-0">
              <th scope="row" className="py-2.5 pr-4 text-left font-normal">
                {month}
              </th>
              <td className="text-ink-2 py-2.5 pr-4 text-right tabular-nums">
                {organic[index].toLocaleString()}
              </td>
              <td className="text-ink-2 py-2.5 pr-4 text-right tabular-nums">
                {referral[index].toLocaleString()}
              </td>
              <td className="text-ink-2 py-2.5 text-right tabular-nums">
                ${revenue[index].toFixed(1)}k
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
