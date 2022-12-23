import styled from "styled-components";
import React from "react";
import { TIME } from "./Welcome";

interface ITime {
  color: String;
  time: String;
  formatTime: number;
  formatStroke: number;
}

const Container = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Line = styled.svg`
  position: relative;
  width: 150px;
  height: 150px;
  transform: rotateZ(-90deg);
`;

const Circle = styled.circle<{
  color?: String;
  dasharray?: number;
  dashoffset?: number;
}>`
  position: absolute;
  width: 100%;
  height: 100%;
  fill: transparent;
  stroke-width: 8;
  stroke: ${(prop) => (prop.color ? prop.color : "#282828")};
  stroke-linecap: round;
  transform: translate(5px, 5px);
  stroke-dasharray: ${(prop) => prop.dasharray && prop.dasharray};
  stroke-dashoffset: ${(prop) => prop.dashoffset && prop.dashoffset};
`;

const Dot = styled.div<{ color: String; rotate: number }>`
  position: absolute;
  text-align: center;
  font-weight: 500;
  color: #fff;
  font-size: 1.5em;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transform: rotateZ(${(prop) => prop.rotate}deg);
  ::before {
    content: "";
    position: absolute;
    top: -3px;
    width: 15px;
    height: 15px;
    background: ${(prop) => prop.color};
    border-radius: 50%;
    box-shadow: 0 0 20px ${(prop) => prop.color},
      0 0 60px ${(prop) => prop.color};
  }
`;

const Timeout = styled.div`
  position: absolute;
  text-align: center;
  font-weight: 500;
  color: #fff;
  font-size: 2em;
`;

const TimeDistribution = styled.span`
  position: absolute;
  transform: translateX(-50%) translateY(5px);
  font-size: 0.35em;
  font-weight: 300;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

function Time({ color, time, formatTime, formatStroke }: ITime) {
  const formatDot = (formatTime: number, time: String): number => {
    if (time === TIME.Days) {
      return formatTime * 0.986;
    }
    if (time === TIME.Hours) return formatTime * 15;
    return formatTime * 6;
  };
  return (
    <Container>
      <Dot color={`${color}`} rotate={formatDot(formatTime, time)}></Dot>
      <Line>
        <Circle cx="70" cy="70" r="70"></Circle>
        <Circle
          cx="70"
          cy="70"
          r="70"
          dasharray={440}
          dashoffset={formatStroke}
          color={`${color}`}
        ></Circle>
      </Line>
      <Timeout>
        {formatTime}
        <br />
        <TimeDistribution>{time}</TimeDistribution>
      </Timeout>
    </Container>
  );
}

export default React.memo(Time);
