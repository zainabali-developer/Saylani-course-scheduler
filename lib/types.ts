export type Teacher = {
  id: string;
  name: string;
  bio: string;
  email: string;
  phone: string;
  photo_url: string;
};

export type Course = {
  id: string;
  name: string;
  description: string;
  fee: number;
  duration: string;
  color: string;
  photo_url: string;
};

export type ScheduleRow = {
  id: string;
  course_id: string;
  teacher_id: string;
  lab: string;
  day_label: string;
  start_time: string;
  end_time: string;
  batch: string;
  courses?: Course;
  teachers?: Teacher;
};
