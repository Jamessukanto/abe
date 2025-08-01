import { ROOM_PREFIX, RoomOpenMode } from '@annotator/dotcom-shared'
import { notFound } from '@annotator/worker-shared'
import { IRequest } from 'itty-router'
import { Environment } from '../types'
import { isRoomIdTooLong, roomIdIsTooLong } from '../utils/roomIdIsTooLong'
import { getSlug } from '../utils/roomOpenMode'

export async function joinExistingRoom(
	request: IRequest,
	env: Environment,
	roomOpenMode: RoomOpenMode
): Promise<Response> {
	const roomId = await getSlug(env, request.params.roomId, roomOpenMode)
	if (!roomId) return notFound()
	if (isRoomIdTooLong(roomId)) return roomIdIsTooLong()

	// This needs to be a websocket request!
	if (request.headers.get('upgrade')?.toLowerCase() === 'websocket') {
		// Set up the durable object for this room
		const id = env.ANNOTATOR_DOC.idFromName(`/${ROOM_PREFIX}/${roomId}`)
		return env.ANNOTATOR_DOC.get(id).fetch(request)
	}

	return notFound()
}
