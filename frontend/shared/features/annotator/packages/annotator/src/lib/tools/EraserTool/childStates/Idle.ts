import { StateNode, TLPointerEventInfo } from '@annotator/editor'

export class Idle extends StateNode {
	static override id = 'idle'

	override onPointerDown(info: TLPointerEventInfo) {
		this.parent.transition('pointing', info)
	}

	override onCancel() {
		this.editor.setCurrentTool('select')
	}
}
