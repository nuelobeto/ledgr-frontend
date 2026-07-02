import axios from "axios"
import { ICurrentUser, IUpdateProfile } from "./types"

const getMe = async () => {
  const { data } = await axios.get<ICurrentUser>("/api/users/me")
  return data
}

const updateMe = async (payload: IUpdateProfile) => {
  const { data } = await axios.patch<ICurrentUser>("/api/users/me", payload)
  return data
}

const services = {
  getMe,
  updateMe,
}

export default services
