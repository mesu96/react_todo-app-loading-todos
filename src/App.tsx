/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';

import { UserWarning } from './UserWarning';
import { USER_ID, getTodos } from './api/todos';
import { Todo } from './types/Todo';

type FilterStatus = 'all' | 'active' | 'completed';

const ERROR_HIDE_DELAY = 3000;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [, setIsLoading] = useState(false);

  const [filter, setFilter] = useState<FilterStatus>('all');

  const [error, setError] = useState<string | null>(null);
  const hideErrorTimeoutId = useRef<number | null>(null);

  const clearErrorTimeout = () => {
    if (hideErrorTimeoutId.current !== null) {
      window.clearTimeout(hideErrorTimeoutId.current);
      hideErrorTimeoutId.current = null;
    }
  };

  const hideError = () => {
    clearErrorTimeout();
    setError(null);
  };

  const showError = (message: string) => {
    clearErrorTimeout();
    setError(message);

    hideErrorTimeoutId.current = window.setTimeout(() => {
      setError(null);
      hideErrorTimeoutId.current = null;
    }, ERROR_HIDE_DELAY);
  };

  useEffect(() => {
    if (!USER_ID) {
      return;
    }

    hideError();
    setIsLoading(true);

    getTodos()
      .then(setTodos)
      .catch(() => {
        showError('Unable to load todos');
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      clearErrorTimeout();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCount = useMemo(
    () => todos.filter(t => !t.completed).length,
    [todos],
  );

  const completedCount = useMemo(
    () => todos.filter(t => t.completed).length,
    [todos],
  );

  const isAllCompleted = useMemo(
    () => todos.length > 0 && todos.every(t => t.completed),
    [todos],
  );

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const createFilterHandler =
    (status: FilterStatus) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      setFilter(status);
    };

  const handleFilterAll = createFilterHandler('all');
  const handleFilterActive = createFilterHandler('active');
  const handleFilterCompleted = createFilterHandler('completed');

  const handleHideError = () => {
    hideError();
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className={classNames('todoapp__toggle-all', {
              active: isAllCompleted,
            })}
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        <section
          className={classNames('todoapp__main', {
            hidden: todos.length === 0,
          })}
          data-cy="TodoList"
        >
          {filteredTodos.map(todo => (
            <div
              key={todo.id}
              data-cy="Todo"
              className={classNames('todo', { completed: todo.completed })}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={todo.completed}
                  readOnly
                />
              </label>

              <span data-cy="TodoTitle" className="todo__title">
                {todo.title}
              </span>

              {/* Remove button appears only on hover */}
              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
              >
                ×
              </button>

              {/* overlay will cover the todo while it is being deleted or updated */}
              <div data-cy="TodoLoader" className="modal overlay">
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          ))}
        </section>

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {`${activeCount} item${activeCount === 1 ? '' : 's'} left`}
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={classNames('filter__link', {
                  selected: filter === 'all',
                })}
                data-cy="FilterLinkAll"
                onClick={handleFilterAll}
              >
                All
              </a>

              <a
                href="#/active"
                className={classNames('filter__link', {
                  selected: filter === 'active',
                })}
                data-cy="FilterLinkActive"
                onClick={handleFilterActive}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={classNames('filter__link', {
                  selected: filter === 'completed',
                })}
                data-cy="FilterLinkCompleted"
                onClick={handleFilterCompleted}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled={completedCount === 0}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: error === null },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={handleHideError}
        />
        {/* show only one message at a time */}
        {error}
      </div>
    </div>
  );
};
