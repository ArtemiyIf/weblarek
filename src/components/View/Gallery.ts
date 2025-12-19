import {Component} from '../base/Component.ts';

type TGalleryViewData = {
    items: HTMLElement[];
}

export class GalleryView extends Component<TGalleryViewData> {
    constructor(protected readonly container: HTMLElement) {
        super(container);
    }
    set items(catalogItems: HTMLElement[]) {
        this.container.replaceChildren(...catalogItems);
    }
}