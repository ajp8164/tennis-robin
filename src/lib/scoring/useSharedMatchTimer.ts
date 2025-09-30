import { useEffect, useMemo, useRef, useState } from 'react';

import { updateDocument, useDocument } from 'firebase/firestore';
import { decodeSportEvent, encodeSportEvent } from 'lib/sportEvent';
import lodash from 'lodash';
import { DateTime } from 'luxon';
import {
  ElapsedTime,
  MatchTimerState,
  SportEventEncoded,
} from 'types/sportEvent';

interface Props {
  sportEventId: string;
  round: number;
  court: number;
  controllerId?: string;
}

export const useSharedMatchTimer = (props: Props) => {
  const { sportEventId, round: r, court: c } = props;

  const { doc: sportEventEncoded } = useDocument<SportEventEncoded>(
    'SportEvents',
    sportEventId,
  );

  const sportEvent = useMemo(
    () => decodeSportEvent(sportEventEncoded),
    [sportEventEncoded],
  );

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
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const timer = sportEvent?.schedule?.matchDetails?.[r]?.[c].timer ?? {
      elapsedTime: { hours: 0, minutes: 0 },
      resumeTime: DateTime.now().toISO(),
      status: 'running',
    };

    setStatus(timer.status);
    baseElapsedRef.current = timer.elapsedTime;

    resumeTimeRef.current = timer.resumeTime
      ? DateTime.fromISO(timer.resumeTime)
      : null;

    if (timer.status === 'initial' || timer.status === 'running') {
      tick();
      tickTimeoutRef.current && clearTimeout(tickTimeoutRef.current);
      tickTimeoutRef.current = setTimeout(tick, 3 * 1000);
    } else {
      setElapsed(timer.elapsedTime);

      if (timer.status === 'ended' || timer.status === 'abandoned') {
        cancel();
      }
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, c, sportEvent?.schedule?.matchDetails]);

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
      tickTimeoutRef.current = setTimeout(tick, 3 * 1000);
    }
  };

  // Controller actions (only the "master" device should call these)
  const start = async () => {
    if (!sportEvent?.schedule) return;
    const updated = lodash.cloneDeep(sportEvent?.schedule?.matchDetails) || [];

    lodash.set(updated, `[${r}][${c}].timer`, {
      elapsedTime: baseElapsedRef.current,
      resumeTime: DateTime.now().toISO(),
      status: 'running',
    });

    updateDocument<SportEventEncoded>(
      'SportEvents',
      encodeSportEvent({
        ...sportEvent,
        schedule: {
          ...sportEvent.schedule,
          matchDetails: updated,
        },
      }),
    );
  };

  const pause = async () => haltWithState('paused');

  const end = async () => haltWithState('ended');

  const abandon = async () => haltWithState('abandoned');

  const haltWithState = async (status: MatchTimerState) => {
    if (!sportEvent?.schedule || !resumeTimeRef.current) return;

    const diff = DateTime.now().diff(resumeTimeRef.current, ['minutes']);
    const totalMinutes =
      baseElapsedRef.current.hours * 60 +
      baseElapsedRef.current.minutes +
      diff.as('minutes');

    const newElapsed = {
      hours: Math.floor(totalMinutes / 60),
      minutes: Math.floor(totalMinutes % 60),
    };

    const updated = lodash.cloneDeep(sportEvent?.schedule?.matchDetails) || [];

    lodash.set(updated, `[${r}][${c}].timer`, {
      elapsedTime: newElapsed,
      resumeTime: null,
      status,
    });

    updateDocument<SportEventEncoded>(
      'SportEvents',
      encodeSportEvent({
        ...sportEvent,
        schedule: {
          ...sportEvent.schedule,
          matchDetails: updated,
        },
      }),
    );
  };

  const reset = async () => {
    if (!sportEvent?.schedule) return;
    const updated = lodash.cloneDeep(sportEvent?.schedule?.matchDetails) || [];

    lodash.set(updated, `[${r}][${c}].timer`, {
      elapsedTime: { hours: 0, minutes: 0 },
      resumeTime: null,
      status: 'initial',
    });

    updateDocument<SportEventEncoded>(
      'SportEvents',
      encodeSportEvent({
        ...sportEvent,
        schedule: {
          ...sportEvent.schedule,
          matchDetails: updated,
        },
      }),
    );
  };

  const cancel = () => {
    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current);
      tickTimeoutRef.current = null;
    }
  };

  return { elapsed, status, loading, start, pause, end, reset, abandon };
};
