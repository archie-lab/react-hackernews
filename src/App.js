import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'

// just to show inline style usage
const largeColumn = {
  width: '40%'
}

const midColumn = {
  width: '30%'
}

const smallColumn = {
  width: '10%'
}

// use high ordered function
const isSearched = searchInput => item => !searchInput || item.title.toLowerCase().includes(searchInput.toLowerCase())

const Search = ({search, onChange, children}) =>
  <form>
    {children}<input type="text" value={search} onChange={onChange} />
  </form>

const Button = ({onClick, className = '', children}) =>
  <button
    className={className}
    onClick={onClick}
    type="button">
    {children}
  </button>

const NewsList = ({list, pattern, onDismiss}) =>
  <div className="table">
    {list.filter(isSearched(pattern)).map(item =>
      <div key={item.objectID} className="table-row">
        <span style={largeColumn}>
          <a href={item.url}>{item.title}</a>
        </span>
        <span style={midColumn}>{item.author}</span>
        <span style={smallColumn}>{item.num_comments}</span>
        <span style={smallColumn}>{item.points}</span>
        <span style={smallColumn}>
          <Button className="button-inline" onClick={() => onDismiss(item.objectID)}>Dismiss</Button>
        </span>
      </div>
    )}
  </div>

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {list: LIST, search: ''}
  }

  onDismiss = (id) => {
    this.setState({list: this.state.list.filter(item => item.objectID !== id)})
  }

  onSearchChange = (e) => {
    this.setState({search: e.target.value})
  }

  render () {
    const {list, search} = this.state
    return (
      <div className="page">
        <div className="interactions">
          <Search search={search} onChange={this.onSearchChange}>Search</Search>
          <NewsList list={list} pattern={search} onDismiss={this.onDismiss} />
        </div>
      </div>
    )
  }
}

Search.propTypes = {
  search: PropTypes.string.isRequired
}

const LIST = [
  {
    title: 'React',
    url: 'https://facebook.github.io/react/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0
  },
  {
    title: 'Redux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1
  }
]

export default App
