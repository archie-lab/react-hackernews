import React from 'react'
import ReactDOM from 'react-dom'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import App, { Search, Button, NewsList } from './App'

describe('App', () => {
  it('renders', () => {
    const div = document.createElement('div')
    ReactDOM.render(<App isLoading />, div)
  })

  test('snapshots', () => {
    const component = renderer.create(<App isLoading />)
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('Search', () => {
  it('renders', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Search>Search</Search>, div)
  })

  test('snapshots', () => {
    const component = renderer.create(<Search>Search</Search>)
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('Button', () => {
  it('renders', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Button>Give Me More</Button>, div)
  })

  test('snapshots', () => {
    const component = renderer.create(
      <Button>Give Me More</Button>
    )
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('NewsList', () => {
  const props = {
    list: [
      {title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y'},
      {title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z'}
    ],
    sortKey: 'TITLE',
    isSortReverse: false
  }

  it('renders', () => {
    const div = document.createElement('div')
    ReactDOM.render(<NewsList {...props} />, div)
  })

  it('shows two items in list', () => {
    const element = shallow(<NewsList {...props} />)
    expect(element.find('.table-row').length).toBe(2)
  })

  test('snapshots', () => {
    const component = renderer.create(
      <NewsList {...props} />
    )
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
