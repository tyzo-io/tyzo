import React from "react";
import { Input } from "../ui/input";

export const DurationInput = React.forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (value: string) => void;
  }
>(({ value = "", onChange }, ref) => {
  const [hours, setHours] = React.useState(() => {
    const match = value.match(/(\d+)h/);
    return match ? match[1] : "";
  });
  const [minutes, setMinutes] = React.useState(() => {
    const match = value.match(/(\d+)m/);
    return match ? match[1] : "";
  });
  const [seconds, setSeconds] = React.useState(() => {
    const match = value.match(/(\d+)s/);
    return match ? match[1] : "";
  });

  const updateDuration = (h: string, m: string, s: string) => {
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (s) parts.push(`${s}s`);
    onChange(parts.join(""));
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="relative">
        <Input
          ref={ref}
          type="number"
          min="0"
          value={hours}
          onChange={(e) => {
            setHours(e.target.value);
            updateDuration(e.target.value, minutes, seconds);
          }}
          placeholder="Hours"
        />
        <div className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
          h
        </div>
      </div>
      <div className="relative">
        <Input
          type="number"
          min="0"
          max="59"
          value={minutes}
          onChange={(e) => {
            setMinutes(e.target.value);
            updateDuration(hours, e.target.value, seconds);
          }}
          placeholder="Minutes"
        />
        <div className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
          m
        </div>
      </div>
      <div className="relative">
        <Input
          type="number"
          min="0"
          max="59"
          value={seconds}
          onChange={(e) => {
            setSeconds(e.target.value);
            updateDuration(hours, minutes, e.target.value);
          }}
          placeholder="Seconds"
        />
        <div className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
          s
        </div>
      </div>
    </div>
  );
});

DurationInput.displayName = "DurationInput";
