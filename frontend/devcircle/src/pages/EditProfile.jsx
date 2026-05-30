
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useNavigate } from 'react-router-dom'
import { updateProfile, uploadAvatar } from '../features/users/userSlice'
import { getMe } from '../features/auth/authSlice'

import Button from '../components/shared/Button'
import Avatar from '../components/shared/Avatar'
import ErrorMessage from '../components/shared/ErrorMessage'

const EditProfile = () => {
  const dispatch = useDispatch()

  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const { loading, error } = useSelector((state) => state.users)

  const [form, setForm] = useState({

    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    githubLink: user?.githubLink || '',
    website: user?.website || '',
  })
  const [avatarFile, setAvatarFile] = useState(null)

  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saved, setSaved] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleAvatarChange = (e) => {

    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    const profileData = {

      bio: form.bio,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      githubLink: form.githubLink,
      website: form.website,
    }

    await dispatch(updateProfile(profileData))

    if (avatarFile) {

      const formData = new FormData()
      formData.append('avatar', avatarFile)
      await dispatch(uploadAvatar(formData))
    }

    await dispatch(getMe())

    setSaved(true)
    setTimeout(() => navigate(`/profile/${user.username}`), 1000)
  }

  return (

    <div className="max-w-lg">
      <div className="bg-white border border-gray-200 rounded-xl p-6">

        <h2 className="text-lg font-semibold text-gray-900 mb-5">Edit Profile</h2>

        {error && <ErrorMessage message={error} />}

        {saved && (
          <p className="text-sm text-green-600 mb-3">Saved! Redirecting...</p>

        )}

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-5">
          <Avatar
            src={avatarPreview || user?.avatar}
            username={user?.username}
            size="xl"
          />
          <div>

            <label className="cursor-pointer text-sm text-blue-500 hover:underline">
              Change avatar
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
            />

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>

            <input
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="React, Node.js, Python"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />

            <p className="text-xs text-gray-400 mt-1">Comma separated</p>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>

            <input
              type="url"
              name="githubLink"
              value={form.githubLink}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />

          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </Button>

        </form>
      </div>

    </div>
  )
}

export default EditProfile
