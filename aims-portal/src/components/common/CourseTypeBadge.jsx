import React from 'react';

const CourseTypeBadge = ({ type, targetDepartment }) => {
  if (type === 'department') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Dept: {targetDepartment || 'Core'}
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Open Elective
    </span>
  );
};

export default CourseTypeBadge;