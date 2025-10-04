import { useEffect, useRef, useState } from 'react';

import { updateDocument } from 'firebase/firestore';
import { DateTime } from 'luxon';
import { ElapsedTime, Match, MatchTimerState } from 'types/match';

interface Props {
  match?: Match;
}

export const useSharedMatchTimer = (props: Props) => {
  const { match } = props;

  const [status, setStatus] = useState<MatchTimerState>('initial');
  const statusRef = useRef<MatchTimerState>(status);

  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState<ElapsedTime>({
    hours: 0,
    minutes: 0,
  });

  const resumeTimeRef = useRef<DateTime | null>(null);
  const baseElapsedRef = useRef<ElapsedTime>({ hours: 0, minutes: 0 });
  const tickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const tick = () => {
      if (statusRef.current === 'running' && resumeTimeRef.current) {
        const diff = DateTime.now().diff(resumeTimeRef.current, ['minutes']);
        const totalMinutes =
          baseElapsedRef.current.hours * 60 +
          baseElapsedRef.current.minutes +
          diff.as('minutes');

        setElapsed({
          hours: Math.floor(totalMinutes / 60),
          minutes: Math.floor(totalMinutes % 60),
        });

        tickTimeoutRef.current && clearTimeout(tickTimeoutRef.current);
        tickTimeoutRef.current = setTimeout(tick, 60 * 1000);
      }
    };

    if (!match) return;

    const timer = match.timer;

    setStatus(timer.status);
    statusRef.current = timer.status;

    baseElapsedRef.current = timer.elapsedTime;

    resumeTimeRef.current = timer.resumeTime
      ? DateTime.fromISO(timer.resumeTime)
      : null;

    if (timer.status === 'initial' || timer.status === 'running') {
      tick();
      tickTimeoutRef.current && clearTimeout(tickTimeoutRef.current);
      tickTimeoutRef.current = setTimeout(tick, 60 * 1000);
    } else {
      setElapsed(timer.elapsedTime);
      if (timer.status === 'ended' || timer.status === 'abandoned') {
        cancel();
      }
    }

    setLoading(false);
  }, [match]);

  // Controller actions (only the "master" device should call these)
  const start = async () => {
    if (!match) return;
    updateDocument<Partial<Match>>('Matches', {
      id: match.id,
      timer: {
        elapsedTime: baseElapsedRef.current,
        resumeTime: DateTime.now().toISO(),
        status: 'running',
      },
    });
  };

  const pause = async () => haltWithState('paused');

  const end = async () => haltWithState('ended');

  const abandon = async () => haltWithState('abandoned');

  const haltWithState = async (status: MatchTimerState) => {
    if (!match || !resumeTimeRef.current) return;

    const diff = DateTime.now().diff(resumeTimeRef.current, ['minutes']);
    const totalMinutes =
      baseElapsedRef.current.hours * 60 +
      baseElapsedRef.current.minutes +
      diff.as('minutes');

    const newElapsed = {
      hours: Math.floor(totalMinutes / 60),
      minutes: Math.floor(totalMinutes % 60),
    };

    updateDocument<Partial<Match>>('Matches', {
      id: match.id,
      timer: {
        elapsedTime: newElapsed,
        resumeTime: '',
        status,
      },
    });
  };

  const reset = async () => {
    if (!match) return;
    updateDocument<Partial<Match>>('Matches', {
      id: match.id,
      timer: {
        elapsedTime: { hours: 0, minutes: 0 },
        resumeTime: '',
        status: 'initial',
      },
    });
  };

  const cancel = () => {
    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current);
      tickTimeoutRef.current = null;
    }
  };

  return { elapsed, status, loading, start, pause, end, reset, abandon };
};
