export type ContentSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type ModuleContent = {
  moduleTitle: string;
  sections: ContentSection[];
  links: { label: string; url: string }[];
};

export type CourseContentData = {
  courseSlug: string;
  modules: ModuleContent[];
};
