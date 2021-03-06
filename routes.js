const express = require('express')
const router = express.Router()

const artists = require('./data/artists.json')
const albums = require('./data/albums.json')
const songs = require('./data/songs.json')

function convertToMinutes(time) {
  let minutes = Math.floor(time / 60)
  let seconds = time - minutes * 60
  if (seconds < 10) {
    seconds = "0"+seconds
  }
  return minutes + ':' + seconds
}

const albumsFullData = albums.map((album) => {
  album.artist = artists.filter((artist) => {
    return artist.id === album.artist_id
  })[0].name
  album.song_count = songs.reduce((acc, nextSong) => {
    if (album.id === nextSong.album_id) {
      acc++
    } else {
      acc = acc
    }
    return acc
  }, 0)
  return album
})

const songsFullData = songs.map((song) => {
  const correspondingAlbum = albumsFullData.filter((album) => {
    return album.id === song.album_id
  })[0]
  song.album = correspondingAlbum.title
  song.artist = correspondingAlbum.artist
  song.artist_id = correspondingAlbum.artist_id
  song.length = convertToMinutes(song.length)
  return song
})

const artistsFullData = artists.map((artist) => {
  artist.albums = albumsFullData.filter((album) => {
    return album.artist_id == artist.id
  })
  return artist
})

router.get('/', (request, response) => {
  response.render('index', { artists: artistsFullData })
})

router.get('/albums', (request, response) => {
  response.render('albums', {
    albums: albumsFullData
  })
})

router.get('/songs', (request, response) => {
  response.render('songs', {
    songs: songsFullData
  })
})

router.get('/artists/:artist_id', (request, response) => {
  const artist = artistsFullData.filter((artist) => {
    return artist.id == request.params.artist_id
  })[0]

  response.render('artist', {
    name: artist.name,
    genre: artist.genre,
    albums: artist.albums
  })
})

router.get('/albums/:album_id', (request, response) => {
  const album = albumsFullData.filter((album) => {
    return album.id == request.params.album_id
  })[0]

  const albumSongs = songsFullData.filter((song) => {
    return song.album_id == request.params.album_id
  })

  response.render('album', {
    title: album.title,
    year: album.year,
    artist: album.artist,
    songs: albumSongs,
  })
})

module.exports = router
