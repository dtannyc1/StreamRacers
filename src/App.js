import React from 'react';
import { Route, BrowserRouter, NavLink } from 'react-router-dom';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className='app'>
        <header className='site-header'>
          <h1>React from Scratch</h1>
          <nav className='main-nav'>
            <NavLink exact to='/'>
              Home
            </NavLink>
            <NavLink to='/cats'>
              Cats
            </NavLink>
            <NavLink to='/dogs'>
              Dogs
            </NavLink>
          </nav>
        </header>

        <Route exact path='/'>
          <main className='page'>
            <h2>This is the home page</h2>
          </main>
        </Route>

        <Route path='/cats'>
          <Page topic='cats' />
        </Route>

        <Route path='/dogs'>
          <Page topic='dogs' />
        </Route>
      </div >
    </BrowserRouter>
  );
}

function Page({ topic }) {
  return (
    <main className='page'>
      <h2>{topic[0].toUpperCase() + topic.slice(1)}</h2>
      <img src={`https://source.unsplash.com/random?${topic}`} alt={topic} />
    </main>
  );
}
