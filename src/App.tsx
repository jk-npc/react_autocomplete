import React, { useState, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import './App.scss';
import { peopleFromServer } from './data/people';
import { Person } from './types/Person';

export const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const applyQuery = useRef(
    debounce((value: string) => {
      setAppliedQuery(value);
    }, 300),
  );

  useEffect(() => {
    const { current: debouncedApply } = applyQuery;

    return () => {
      debouncedApply.cancel();
    };
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setQuery(value);
    setSelectedPerson(null);
    setIsOpen(true);
    applyQuery.current(value);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleSelect = (person: Person) => {
    setQuery(person.name);
    setAppliedQuery(person.name);
    setIsOpen(false);
    setSelectedPerson(person);
  };

  const filteredPeople = peopleFromServer.filter(person =>
    person.name.toLowerCase().includes(appliedQuery.toLowerCase()),
  );

  const title = selectedPerson
    ? `${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`
    : 'No selected person';

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {title}
        </h1>

        <div className={`dropdown ${isOpen ? 'is-active' : ''}`}>
          <div className="dropdown-trigger">
            <input
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {isOpen && (
            <div
              className="dropdown-menu"
              role="menu"
              data-cy="suggestions-list"
            >
              <div className="dropdown-content">
                {filteredPeople.length > 0 ? (
                  filteredPeople.map(person => (
                    <div
                      key={person.slug}
                      className="dropdown-item"
                      data-cy="suggestion-item"
                      onMouseDown={() => handleSelect(person)}
                    >
                      <p
                        className={
                          person.sex === 'm'
                            ? 'has-text-link'
                            : 'has-text-danger'
                        }
                      >
                        {person.name}
                      </p>
                    </div>
                  ))
                ) : (
                  <div
                    className="
                      notification
                      is-danger
                      is-light
                      mt-3
                      is-align-self-flex-start
                    "
                    role="alert"
                    data-cy="no-suggestions-message"
                  >
                    <p className="has-text-danger">No matching suggestions</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
