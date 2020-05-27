import Helmet from '@app-elements/helmet'
import LoadingIndicator from '@app-elements/loading-indicator'
import { Link } from '@app-elements/router'
import { useRequest } from '@app-elements/use-request'
import { useVariantState } from '@app-elements/use-variant-state'
import { useMappedState } from '@app-elements/use-mapped-state'

import { RoomPassword } from '../components/room-password'
import { ChatBox } from '../components/chatbox'
import { useRoom } from '/apps/chatter/hooks/use-room'

// `url` is a util for getting route paths by name. It's a project
// level util because it reads the statically defined [routes.js](/routes.html)
import url from '/util/url'

// We'll need to pass our store to `useRequest`
import store from '/store'

import { WEB_URL } from '/consts'

// Here is our page component2 which will use the `useRequest` hook.
export function Room ({ id }) {
  const { result, error, isLoading } = useRequest(store, url('api.room', { args: { id } }))
  const passwordObject = useMappedState(store, ({ roomPasswords }) => roomPasswords[id] || {})
  const password = passwordObject.password
  const isCorrect = passwordObject.isCorrect
  const { entries, sendNewEntry } = useRoom(id)

  const {
    checkState,
    transitionTo,
    renderPasswordInput,
    renderChatbox
  } = useVariantState({
    initial: 'initial',
    states: {
      initial: [],
      error: [],
      renderPasswordInput: [],
      renderChatbox: []
    },
    transitions: {
      initial: ['renderPasswordInput', 'renderChatbox', 'error'],
      renderPasswordInput: ['renderChatbox']
    },
    effects: {
      renderPasswordInput: () => {
      },
      renderChatbox: () => {
      }
      // error: () => {
      // }
    }
  })

  if (isLoading) {
    console.log('Still loading room info...')
    return <div className='container mt-2'><LoadingIndicator /></div>
  }
  const { name, hasPassword: passwordRequired } = result
  console.log('Checking state...', isCorrect)
  if (checkState('initial')) {
    console.log('initial state')
    if (passwordRequired && !password) {
      console.log('transitioning to renderPasswordInput')
      transitionTo(renderPasswordInput)
    } else if (!passwordRequired || isCorrect) {
      console.log('transitioning to renderChatbox')
      transitionTo(renderChatbox)
    } else if (error) {
      console.log('transitioning to error')
      transitionTo(error)
    }
  } else if (checkState('renderPasswordInput')) {
    console.log('renderPasswordInput state')
    if (isCorrect) {
      transitionTo(renderChatbox)
    }
  } else if (checkState('renderChatbox')) {
    console.log('renderChatbox state')
  } else if (checkState('error')) {
    console.log('error state')
  }
  console.log('Rendering...')
  return (
    <div key='user' className='container pt-7'>
      <Helmet
        title={name}
        meta={[
          { name: 'description', content: 'Helmet description' },
          { property: 'og:type', content: 'article' },
          { property: 'og:title', content: name },
          { property: 'og:description', content: 'Helmet description' },
          { property: 'og:image', content: 'https://www.gooseinsurance.com/images/blog-image-1.jpg' },
          { property: 'og:url', content: `${WEB_URL}${url('api.room', { args: { id } })}` }
        ]}
      />
      <p><Link name='rooms'>&larr; Back to all rooms</Link></p>
      <h1>{name}</h1>
      {checkState('initial') && <div className='container mt-2'><LoadingIndicator /></div>}
      {checkState('error') && (error.code === 404
        ? <div><p>A chatroom with that name was not found!</p></div>
        : <div><p>Something went wrong!</p></div>)}
      {checkState('renderPasswordInput') && <RoomPassword roomId={id} />}
      {checkState('renderChatbox') && <ChatBox entries={entries} sendNewEntry={sendNewEntry} />}
    </div>
  )
}
