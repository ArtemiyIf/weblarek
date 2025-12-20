import {Component} from '../base/Component.ts';

type TGalleryData = {
    items: HTMLElement[];
}

export class Gallery extends Component<TGalleryData> {
    constructor(protected readonly container: HTMLElement) {
        super(container);
    }
    set items(catalogItems: HTMLElement[]) {
        this.container.replaceChildren(...catalogItems);
    }
}