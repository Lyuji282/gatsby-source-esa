import Frisbee from 'frisbee';
import crypto from 'crypto'

exports.sourceNodes = async ({ boundActionCreators, accessToken, teamName, targetCategory }) => {
  const createNodeFromPost = (post) => {
    const hashId = crypto.createHash(`md5`).update(post.number.toString()).digest('hex')
    const baseNode = {
      id: hashId,
      children: [],
      parent: `__SOURCE__`,
      internal: {
        type: 'EsaPost',
        contentDigest: hashId
      }
    }

    boundActionCreators.createNode(
      Object.assign({}, baseNode, post)
    )
  }

  if (!accessToken) {
    throw 'You neet to set an accessToken.'
  }

  if (!teamName) {
    throw 'You neet to set an teamName.'
  }

  const api = new Frisbee({
    baseURI: 'https://api.esa.io'
  })

  const { body } = await api.jwt(accessToken).get(`/v1/teams/${teamName}/posts`, {
    body: {
      q: `in:${targetCategory}`,
    }
  })

  body.posts.forEach(post => createNodeFromPost(post))

  let next_page = body.next_page
  while ( next_page ) {
    const { body } = await api.jwt(accessToken).get(`/v1/teams/${teamName}/posts`, {
      body: {
        q: `in:${targetCategory}`,
        page: next_page,
      }
    })

    body.posts.forEach(post => createNodeFromPost(post))
    next_page = body.next_page
  }

  return
}