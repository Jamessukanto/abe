import { notFound } from '@annotator/worker-shared'
import { IRequest } from 'itty-router'
import { getR2KeyForRoom } from '../r2'
import { Environment } from '../types'
import { isRoomIdTooLong, roomIdIsTooLong } from '../utils/roomIdIsTooLong'
import { requireWriteAccessToFile } from '../utils/tla/getAuth'
import { isTestFile } from '../utils/tla/isTestFile'

// Returns the history of a room as a list of objects with timestamps
export async function getRoomHistory(
	request: IRequest,
	env: Environment,
	isApp: boolean
): Promise<Response> {
	const roomId = request.params.roomId

	if (!roomId) return notFound()
	if (isRoomIdTooLong(roomId)) return roomIdIsTooLong()

	if (isApp) {
		await requireWriteAccessToFile(request, env, roomId)
	}

	if (isTestFile(roomId)) {
		return new Response('Not found', { status: 404 })
	}

	const versionCacheBucket = env.ROOMS_HISTORY_EPHEMERAL
	const bucketKey = getR2KeyForRoom({ slug: roomId, isApp })

	let batch = await versionCacheBucket.list({
		prefix: bucketKey,
	})
	const result = [...batch.objects.map((o) => o.key)]

	// ✅ - use the truncated property to check if there are more
	// objects to be returned
	while (batch.truncated) {
		const next = await versionCacheBucket.list({
			cursor: batch.cursor,
		})
		result.push(...next.objects.map((o) => o.key))

		batch = next
	}

	// these are ISO timestamps, so they sort lexicographically
	result.sort()

	return new Response(JSON.stringify(result), {
		headers: { 'content-type': 'application/json' },
	})
}
