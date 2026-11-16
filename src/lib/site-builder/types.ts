export type BlockItem = { id: string; label: string; value?: string; type?: string };

export type Block = {
  id: string;
  type: string; // catalog entry id
  props: {
    title?: string;
    showTitle?: boolean;
    text?: string;
    size?: string;
    align?: string;
    label?: string;
    style?: string;
    link?: string;
    alt?: string;
    tone?: string;
    search?: boolean;
    export?: boolean;
    perPage?: string;
    submit?: string;
    saveTo?: string;
    ftype?: string;
    options?: string;
    required?: boolean;
    course?: string;
    readOnly?: boolean;
    hideMobile?: boolean;
    gated?: boolean;
    items?: BlockItem[];
    removed?: BlockItem[];
    [key: string]: unknown;
  };
};

export type Column = { id: string; blocks: Block[] };
export type Row = { id: string; layout: string; cols: Column[] };

export type SelectionState = { row?: string; block?: string } | null;
