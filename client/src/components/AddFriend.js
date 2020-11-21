import React from 'react'
import { UserPlus, Search } from 'tabler-icons-react'

import { Button } from 'rsuite'
import { mainAxios } from '../utils/setAuthToken'
import { socket2 } from '../socket'
import { cl, alert } from '../Util'

const AddFriend = props => {
  const [state, setState] = React.useState({
    searchID: '',
    foundUserName: '',
    foundUserId: ''
  })

  const handleInputChange = e => {
    setState({ ...state, [e.target.name]: e.target.value })
  }

  const searchUser = async e => {
    e.preventDefault()
    const frm = {
      searchID: state.searchID
    }
    cl(frm)
    const post = await mainAxios.post('user/search', frm)
    if (!post) {
      alert('error', 'Something wrong!')
      return false
    }

    setState({
      ...state,
      foundUserName: post.data.username
    })
  }

  const sendFriendReq = async () => {
    await socket2.emit('sendFriendRequest', state.searchID)

    alert('success', 'Invitation sent')
    setState({
      ...state,
      foundUserName: '',
      foundUserId: '',
      searchUsername: ''
    })
  }

  return (
    <div className='newWrapper'>
      <div className='optFields'>
        <p className='usList'>Search users (you need to know their ID first)</p>
        <form onSubmit={searchUser} className='searchInput'>
          <input
            name='searchID'
            label='User ID'
            onChange={handleInputChange}
            className='unField'
          />
          <Button
            type='submit'
            variant='contained'
            color='primary'
            className='searchButton'
            startIcon={<Search />}
          >
            Search
          </Button>
        </form>
        {state.foundUserName.length > 1 && (
          <div className='srchResult'>
            <p>
              {state.foundUserName}{' '}
              <UserPlus className='contactIcon' onClick={sendFriendReq} />
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddFriend
