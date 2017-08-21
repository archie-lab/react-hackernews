import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'

const DEFAULT_QUERY = 'redux'
const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = 'query='

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
    this.state = {search: DEFAULT_QUERY, result: null}
  }

  onDismiss = (id) => {
    const updatedHits = this.state.result.hits.filter(item => item.objectID !== id)
    // this.setState({result: Object.assign({}, this.state.result, {hits: updatedHits})}) // use Object.assign
    this.setState({result: {...this.state.result, hits: updatedHits}}) // use spread for object
  }

  onSearchChange = (e) => {
    this.setState({search: e.target.value})
  }

  setTopStories = (result) => this.setState({result: result})

  fetchTopStories = (searchInput) => {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchInput}`)
      .then(res => res.json())
      .then(result => this.setTopStories(result))
      .catch(e => e)
  }

  componentDidMount () {
    const {search} = this.state
    this.fetchTopStories(search)
  }

  render () {
    const {search, result} = this.state
    return (
      <div className="page">
        <div className="interactions">
          <Search search={search} onChange={this.onSearchChange}>Search</Search>
          {result && <NewsList list={result.hits} pattern={search} onDismiss={this.onDismiss} />}
        </div>
      </div>
    )
  }
}

Search.propTypes = {
  search: PropTypes.string.isRequired
}

export default App
