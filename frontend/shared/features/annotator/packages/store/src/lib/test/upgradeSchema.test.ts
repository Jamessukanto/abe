import { SerializedSchemaV1, upgradeSchema } from '../StoreSchema'

describe('upgradeSchema', () => {
	it('should upgrade a schema from v1 to v2, assuming its working with annotator data', () => {
		const v1: SerializedSchemaV1 = {
			schemaVersion: 1,
			storeVersion: 4,
			recordVersions: {
				asset: {
					version: 1,
					subTypeKey: 'type',
					subTypeVersions: { image: 2, video: 2, bookmark: 0 },
				},
				camera: { version: 1 },
				document: { version: 2 },
				instance: { version: 22 },
				instance_page_state: { version: 5 },
				page: { version: 1 },
				shape: {
					version: 3,
					subTypeKey: 'type',
					subTypeVersions: {
						group: 0,
						text: 1,
						bookmark: 1,
						draw: 1,
						geo: 7,
						note: 4,
						line: 1,
						frame: 0,
						arrow: 1,
						highlight: 0,
						embed: 4,
						image: 2,
						video: 1,
					},
				},
				instance_presence: { version: 5 },
				pointer: { version: 1 },
			},
		}

		expect(upgradeSchema(v1)).toMatchInlineSnapshot(`
		{
		  "ok": true,
		  "value": {
		    "schemaVersion": 2,
		    "sequences": {
		      "com.annotator.asset": 1,
		      "com.annotator.asset.bookmark": 0,
		      "com.annotator.asset.image": 2,
		      "com.annotator.asset.video": 2,
		      "com.annotator.camera": 1,
		      "com.annotator.document": 2,
		      "com.annotator.instance": 22,
		      "com.annotator.instance_page_state": 5,
		      "com.annotator.instance_presence": 5,
		      "com.annotator.page": 1,
		      "com.annotator.pointer": 1,
		      "com.annotator.shape": 3,
		      "com.annotator.shape.arrow": 1,
		      "com.annotator.shape.bookmark": 1,
		      "com.annotator.shape.draw": 1,
		      "com.annotator.shape.embed": 4,
		      "com.annotator.shape.frame": 0,
		      "com.annotator.shape.geo": 7,
		      "com.annotator.shape.group": 0,
		      "com.annotator.shape.highlight": 0,
		      "com.annotator.shape.image": 2,
		      "com.annotator.shape.line": 1,
		      "com.annotator.shape.note": 4,
		      "com.annotator.shape.text": 1,
		      "com.annotator.shape.video": 1,
		      "com.annotator.store": 4,
		    },
		  },
		}
	`)
	})
})
