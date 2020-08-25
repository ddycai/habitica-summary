import React, { useContext, useState } from "react";
import moment from "moment";
import log from "loglevel";

import { Task } from "./HabiticaTypes";
import { DATE_KEY_FORMAT } from "./App";
import { AppContext } from "./UserSummary";
import { TaskIcon } from "./TaskIcon";
import { FoldIcon, UnfoldIcon } from "@primer/octicons-react";

export interface HabitSummaryProps {
  data: Task[];
}

export default function HabitSummary(props: HabitSummaryProps) {
  const context = useContext(AppContext);
  const [showNoHistory, setShowNoHistory] = useState(false);

  return (
    <section className="habits">
      <table>
        <tr>
          <th>
            <div className="section-header">
              <h2>Habits</h2>
              <div
                role="button"
                className="show-no-history clickable"
                title="Show/Hide habits with no data"
                onClick={() => setShowNoHistory(!showNoHistory)}
              >
                {showNoHistory ? (
                  <FoldIcon aria-hidden="true" />
                ) : (
                  <UnfoldIcon aria-hidden="true" />
                )}
              </div>
            </div>
          </th>
          {context.dates.map((day) => (
            <th>
              <div className="date-heading">
                <span>{day.format("MM")}</span>
                <span>{day.format("DD")}</span>
              </div>
            </th>
          ))}
        </tr>
        {props.data.map((habit) => (
          <Habit showNoHistory={showNoHistory} habit={habit} />
        ))}
      </table>
    </section>
  );
}

export function Habit(props: { habit: Task; showNoHistory: boolean }) {
  const context = useContext(AppContext);
  const historyMap = new Map<string, [number, number]>();
  const { text, history } = props.habit;

  log.debug(text);
  for (let record of history) {
    let taskDate = moment(record.date).format(DATE_KEY_FORMAT);
    log.debug(JSON.stringify(record));
    if (record.scoredUp !== undefined && record.scoredDown !== undefined) {
      historyMap.set(taskDate, [record.scoredUp, record.scoredDown]);
    }
  }

  const dailyScores = context.dates
    .map((day) => day.format(DATE_KEY_FORMAT))
    .map((day) => historyMap.get(day));

  if (
    dailyScores.filter((score) => score !== undefined).length === 0 &&
    !props.showNoHistory
  ) {
    // Don't render the component if showNoHistory is off.
    return null;
  }

  return (
    <tr>
      <td className="task-name-row">
        <TaskIcon task={props.habit} />
        <span className="task-name">{text}</span>
      </td>
      {dailyScores.map((score) => {
        if (score) {
          return <HabitScore up={score[0]} down={score[1]} />;
        } else {
          return <td className="habit-cell">&nbsp;</td>;
        }
      })}
    </tr>
  );
}

function HabitScore(props: { up: number; down: number }) {
  return (
    <td className="habit-cell">
      <div className="habit-score-container">
        {props.up > 0 && (
          <div className="success center-wrapper">
            <span>+{props.up}</span>
          </div>
        )}
        {props.down > 0 && (
          <div className="fail center-wrapper">
            <span>-{props.down}</span>
          </div>
        )}
      </div>
    </td>
  );
}