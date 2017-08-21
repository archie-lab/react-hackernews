import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'

const DEFAULT_QUERY = 'redux'
const DEFAULT_PAGE = 0
const DEFAULT_HPP = '100'

const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = 'query='
const PARAM_PAGE = 'page='
const PARAM_HPP = 'hitsPerPage='

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
// const isSearched = searchInput => item => !searchInput ||
//   (!item.title || item.title.toLowerCase().includes(searchInput.toLowerCase()))

const Search = ({search, onChange, children, onSubmit}) =>
  <form onSubmit={onSubmit}>
    {children}<input type="text" value={search} onChange={onChange} />
    <button type="submit">{children}</button>
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
    {list.map(item =>
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

  setTopStories = (result) => {
    const {hits, page} = result
    const oldHits = page !== 0 ? this.state.result.hits : [];
    const updatedHits = [...oldHits, ...hits]
    this.setState({result: {...result, hits: updatedHits}})
  }

  fetchTopStories = (searchInput, page = DEFAULT_PAGE) => {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchInput}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(res => res.json())
      .then(result => this.setTopStories(result))
      .catch(e => e)
  }

  onSearchSubmit = (e) => {
    e.preventDefault()
    this.fetchTopStories(this.state.search)
  }

  componentDidMount () {
    const {search} = this.state
    this.fetchTopStories(search)
  }

  render () {
    const {search, result} = this.state
    const page = (result && result.page) || DEFAULT_PAGE
    return (
      <div className="page">
        <div className="interactions">
          <Search search={search} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>Search</Search>
          {result && <NewsList list={result.hits} pattern={search} onDismiss={this.onDismiss} />}
        </div>
        <div>
          <Button onClick={() => this.fetchTopStories(search, page + 1)}>More</Button>
        </div>
      </div>
    )
  }
}

Search.propTypes = {
  search: PropTypes.string.isRequired
}

export default App
