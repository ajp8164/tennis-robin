import { useEffect, useRef } from 'react';

import {
  FormikErrors,
  FormikTouched,
  FormikValues,
  useFormikContext,
} from 'formik';
import lodash, { isEqual, omit } from 'lodash';

export type FormikStateDeep<T extends FormikValues> = {
  values: T;
  dirty: boolean;
  touched: FormikTouched<T>;
  errors: FormikErrors<T>;
};

export type FormikWatcherState<T extends FormikValues> = {
  next: FormikStateDeep<T>;
  prev: FormikStateDeep<T>;
  changedFields: (keyof T)[];
  isValid: boolean;
  init: boolean;
};

type FormikStateWatcherProps<T extends FormikValues> = {
  dirtyIgnoreFields?: string[];
  onChange: (state: FormikWatcherState<T>) => void;
};

/**
 * Component wrapper for useFormikStateWatcher – useful for declarative use inside Formik tree.
 * dirtyIgnoreFields - an array of field names that should not be included in the form dirty check.
 * onChange - called when the form state changes.
 */
export function FormikStateWatcher<T extends FormikValues>({
  dirtyIgnoreFields,
  onChange,
}: FormikStateWatcherProps<T>) {
  const init = useRef(true);
  const { values, dirty, touched, errors, initialValues } =
    useFormikContext<T>();

  const prevRef = useRef<FormikStateDeep<T>>({
    values,
    dirty,
    touched,
    errors,
  });

  useEffect(() => {
    // As requested, exclude ignored fields from the dirty check.
    let effectiveDirty = dirty;
    if (dirtyIgnoreFields) {
      effectiveDirty = !isEqual(
        omit(values, dirtyIgnoreFields),
        omit(initialValues, dirtyIgnoreFields),
      );
    }

    const isValid = lodash.isEmpty(errors);

    const nextState = { values, dirty: effectiveDirty, touched, errors };
    const prevState = prevRef.current;

    const changedFields = Object.keys(values).filter(key => {
      const k = key as keyof T;
      return values[k] !== prevState.values[k];
    }) as (keyof T)[];

    const hasChanged =
      dirty !== prevState.dirty ||
      JSON.stringify(values) !== JSON.stringify(prevState.values) ||
      JSON.stringify(touched) !== JSON.stringify(prevState.touched) ||
      JSON.stringify(errors) !== JSON.stringify(prevState.errors);

    if (hasChanged || init.current) {
      onChange({
        next: nextState,
        prev: prevState,
        changedFields,
        isValid,
        init: init.current,
      });
      prevRef.current = nextState;
      init.current = false;
    }
  }, [
    values,
    dirty,
    touched,
    errors,
    dirtyIgnoreFields,
    initialValues,
    onChange,
  ]);

  return null;
}
