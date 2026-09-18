export type CodeBlock = {
  language: string;
  code: string;
};

export type SubModuleSection = {
  heading: string;
  body: string;
  bullets?: string[];
  code?: CodeBlock;
};

export type SubModuleContent = {
  /** Must exactly match an existing CourseModule.title for this course. */
  moduleTitle: string;
  /** Must exactly match an existing CourseSubModule.title under that module. */
  subModuleTitle: string;
  /** One framing paragraph: what this sub-module covers and why it matters. */
  overview: string;
  /** The deep-dive body — aim for 6-9 substantial sections. */
  sections: SubModuleSection[];
  /** Concrete mistakes/misconceptions learners commonly run into on this exact topic. */
  commonPitfalls: string[];
  /** The distilled, memorable takeaways a student should walk away with. */
  keyTakeaways: string[];
  links: { label: string; url: string }[];
};

export type CourseSubModuleContentData = {
  courseSlug: string;
  submodules: SubModuleContent[];
};
