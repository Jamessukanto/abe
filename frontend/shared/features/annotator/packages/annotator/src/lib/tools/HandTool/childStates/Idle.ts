import { StateNode, TLPointerEventInfo } from '@annotator/editor'

export class Idle extends StateNode {
	static override id = 'idle'

	override onEnter() {
		this.editor.setCursor({ type: 'grab', rotation: 0 })
	}

	override onPointerDown(info: TLPointerEventInfo) {
		this.parent.transition('pointing', info)
	}

	override onCancel() {
		this.editor.setCurrentTool('select')
	}
}
