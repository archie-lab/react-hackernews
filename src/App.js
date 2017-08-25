import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'

const DEFAULT_QUERY = 'redux'
const DEFAULT_PAGE = 0
const DEFAULT_HPP = '10'

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

class Search extends Component {
  componentDidMount () {
    this.input.focus()
    this.input.setSelectionRange(this.props.search.length, this.props.search.length)
  }

  render () {
    const {search, onChange, children, onSubmit} = this.props

    return (<form onSubmit={onSubmit}>
      {children}<input type="text" value={search} onChange={onChange} ref={(node) => { this.input = node }} />
      <button type="submit">{children}</button>
    </form>)
  }
}

const Button = ({onClick, className, children}) =>
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
    this.state = {search: DEFAULT_QUERY, results: null, searchKey: ''}
  }

  onDismiss = (id) => {
    const {results, searchKey} = this.state
    const {hits, page} = results[searchKey]
    const updatedHits = hits.filter(item => item.objectID !== id)
    this.setState({results: {...results, [searchKey]: {hits: updatedHits, page}}})
  }

  onSearchChange = (e) => {
    this.setState({search: e.target.value})
  }

  setTopStories = (result) => {
    const {hits, page} = result
    const {results, searchKey} = this.state
    const oldHits = page !== 0 ? (results && results[searchKey]
      ? results[searchKey].hits
      : []) : []
    const updatedHits = [...oldHits, ...hits]
    this.setState({
      results: {
        ...results,
        [searchKey]: {hits: updatedHits, page}
      }
    })
  }

  fetchTopStories = (searchInput, page = DEFAULT_PAGE) => {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchInput}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(res => res.json())
      .then(result => this.setTopStories(result))
      .catch(e => e)
  }

  onSearchSubmit = (e) => {
    e.preventDefault()
    this.setState({searchKey: this.state.search})
    if (!(this.state.results && this.state.results[this.state.search])) {
      this.fetchTopStories(this.state.search)
    }
  }

  componentDidMount () {
    const {search} = this.state
    this.setState({searchKey: search})
    this.fetchTopStories(search)
  }

  render () {
    const {search, results, searchKey} = this.state
    const page = (results && results[searchKey] && results[searchKey].page) || DEFAULT_PAGE
    return (
      <div className="page">
        <div className="interactions">
          <Search search={search} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>Search</Search>
          {results && results[searchKey] &&
          <NewsList list={results[searchKey].hits} pattern={search} onDismiss={this.onDismiss} />}
        </div>
        <div>
          <Button onClick={() => this.fetchTopStories(search, page + 1)}>More</Button>
        </div>
      </div>
    )
  }
}

Button.defaultProps = {
  className: ''
}

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
}

Search.propTypes = {
  search: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired
}

NewsList.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({
    objectID: PropTypes.string.isRequired,
    title: PropTypes.string,
    author: PropTypes.string,
    url: PropTypes.string,
    num_comments: PropTypes.number,
    points: PropTypes.number
  })).isRequired,
  onDismiss: PropTypes.func,
  pattern: PropTypes.string
}

export {
  Search,
  Button,
  NewsList
}

export default App
