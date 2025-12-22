import {Component} from '../base/Component.ts';

type TGalleryData = {
    items: HTMLElement[];
}

export class Gallery extends Component<TGalleryData> {
    constructor(protected readonly container: HTMLElement) {
        super(container);
        console.log('Gallery создан, контейнер:', container);
    }
    
    set items(catalogItems: HTMLElement[]) {
        console.log('Gallery.items установлено:', catalogItems.length, 'элементов');
        this.container.replaceChildren(...catalogItems);
        console.log('Дети контейнера теперь:', this.container.children.length);
    }
}