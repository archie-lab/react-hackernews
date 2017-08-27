import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { sortBy } from 'lodash'
import classnames from 'classnames'
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

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse()
}

const updateTopStoriesState = (hits, page) => prevState => {
  const {results, searchKey} = prevState
  const oldHits = page !== 0 ? (results && results[searchKey]
    ? results[searchKey].hits
    : []) : []
  const updatedHits = [...oldHits, ...hits]
  return {
    results: {
      ...results,
      [searchKey]: {hits: updatedHits, page}
    },
    isLoading: false
  }
}

// use high ordered function
// const isSearched = searchInput => item => !searchInput ||
//   (!item.title || item.title.toLowerCase().includes(searchInput.toLowerCase()))

class Search extends Component {
  // test fails
  // componentDidMount () {
  //   this.input.focus()
  //   this.input.setSelectionRange(this.props.search.length, this.props.search.length)
  // }

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

const Loading = () => <div>Loading...</div>

const withLoading = (Component) => ({isLoading, ...rest}) => isLoading ? <Loading /> : <Component {...rest} />

const ButtonWithLoading = withLoading(Button)

const Sort = ({sortKey, onSort, children, activeSortKey}) => {
  const sortaClass = classnames(
    'button-inline',
    {'button-active': sortKey === activeSortKey}
  )
  return <Button onClick={() => onSort(sortKey)}
                 className={sortaClass}>{children}</Button>
}

class NewsList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      sortKey: 'NONE',
      isSortReverse: false
    }
  }

  onSort = (sortKey) => {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse
    this.setState({sortKey, isSortReverse})
  }

  render () {
    const {list, onDismiss} = this.props
    const {sortKey, isSortReverse} = this.state
    let sortedList = SORTS[sortKey](list)
    if (isSortReverse) {
      sortedList = sortedList.reverse()
    }
    return <div className="table">
      <div className="table-header">
        <span style={largeColumn}>
          <Sort sortKey="TITLE" onSort={this.onSort} activeSortKey={sortKey}>Title</Sort>
        </span>
        <span style={midColumn}>
          <Sort sortKey="AUTHOR" onSort={this.onSort} activeSortKey={sortKey}>Author</Sort>
        </span>
        <span style={smallColumn}>
          <Sort sortKey="COMMENTS" onSort={this.onSort} activeSortKey={sortKey}>Comments</Sort>
        </span>
        <span style={smallColumn}>
          <Sort sortKey="POINTS" onSort={this.onSort} activeSortKey={sortKey}>Points</Sort>
        </span>
        <span style={smallColumn}>
        Archive
      </span>
      </div>
      {sortedList.map(item =>
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
  }
}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      search: DEFAULT_QUERY,
      results: null,
      searchKey: '',
      isLoading: true
    }
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
    this.setState(updateTopStoriesState(hits, page))
  }

  fetchTopStories = (searchInput, page = DEFAULT_PAGE) => {
    this.setState({isLoading: true})
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
    const {search, results, searchKey, isLoading} = this.state
    const page = (results && results[searchKey] && results[searchKey].page) || DEFAULT_PAGE
    return (
      <div className="page">
        <div className="interactions">
          <Search search={search} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>Search</Search>
          {results && results[searchKey] &&
          <NewsList list={results[searchKey].hits}
                    pattern={search}
                    onDismiss={this.onDismiss} />}
        </div>
        <div>
          {<ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchTopStories(searchKey, page + 1)}>
            More
          </ButtonWithLoading>}
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
  onDismiss: PropTypes.func
}

export {
  Search,
  Button,
  NewsList
}

export default App
