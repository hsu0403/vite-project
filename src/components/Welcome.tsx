import React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Time from "./Time";

export enum TIME {
  Days = "Days",
  Hours = "Hours",
  Minutes = "Minutes",
  Seconds = "Seconds",
}

type Timer = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type Stroke = {
  d: number;
  h: number;
  m: number;
  s: number;
};

export default function Welcome() {
  const [newYear, setNewYear] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState<Timer>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [stroke, setStroke] = useState<Stroke>({
    d: 440,
    h: 440,
    m: 440,
    s: 440,
  });
  let endDate = "01/01/2023 00:00:00";

  const formatFunc = (): Timer => {
    let now = new Date(endDate).getTime();
    let countDown = new Date().getTime();
    let distance = now - countDown;

    if (distance < 0) {
      setNewYear(true);
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };
  const formatStroke = ({ days, hours, minutes, seconds }: Timer): Stroke => {
    let d = 440 - (440 * days) / 365;
    let h = 440 - (440 * hours) / 24;
    let m = 440 - (440 * minutes) / 60;
    let s = 440 - (440 * seconds) / 60;
    return { d, h, m, s };
  };

  useEffect(() => {
    const { days, hours, minutes, seconds } = formatFunc();
    const { d, h, m, s } = formatStroke({ days, hours, minutes, seconds });
    setTime({ days, hours, minutes, seconds });
    setStroke({ d, h, m, s });
    setLoading(true);
  }, []);
  useEffect(() => {
    if (loading) {
      let timer = setInterval(() => {
        const { days, hours, minutes, seconds } = formatFunc();
        const { d, h, m, s } = formatStroke({ days, hours, minutes, seconds });

        if (time.days !== days) {
          setTime({ ...time, days });
          setStroke({ ...stroke, d });
        }
        if (time.hours !== hours) {
          setTime({ ...time, hours });
          setStroke({ ...stroke, h });
        }
        if (time.minutes !== minutes) {
          setTime({ ...time, minutes });
          setStroke({ ...stroke, m });
        }
        setTime({ ...time, seconds });
        setStroke({ ...stroke, s });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading]);

  //console.log(import.meta.env);
  return (
    <>
      {newYear ? (
        <h2 className="newYear">
          2023
          <br />
          <span>Happy New Year</span>
        </h2>
      ) : (
        <div id="time">
          <Time
            color="#fff"
            time={TIME.Days}
            formatTime={time.days}
            formatStroke={stroke.d}
          />
          <Time
            color="#ff2972"
            time={TIME.Hours}
            formatTime={time.hours}
            formatStroke={stroke.h}
          />
          <Time
            color="#29ff3b"
            time={TIME.Minutes}
            formatTime={time.minutes}
            formatStroke={stroke.m}
          />
          <Time
            color="#f1ff29"
            time={TIME.Seconds}
            formatTime={time.seconds}
            formatStroke={stroke.s}
          />
        </div>
      )}
    </>
  );
}
