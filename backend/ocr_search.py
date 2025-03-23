import os
import argparse
import re
import csv
import json
from typing import List, Dict, Set, Tuple
from pdf2image import convert_from_path
import easyocr
import numpy as np
from collections import defaultdict

# Initialize EasyOCR reader
reader = easyocr.Reader(['en', 'ch_sim'], gpu=True)  # Added Chinese support

class CourseAnalyzer:
    """Class to analyze transcript courses and provide recommendations"""
    
    def __init__(self, database_path: str = None, requirements_json: str = None):
        """
        Initialize the course analyzer
        
        Args:
            database_path: Path to CSV file containing course information
            requirements_json: Path to requirements JSON file
        """
        self.completed_courses = set()
        self.all_courses = set()
        self.course_data = {}  # Store course information
        self.prerequisites = {}  # Store prerequisite relationships
        self.same_field_courses = {}  # Store courses in the same field
        self.course_sequence_map = {}  # Store course progression sequences
        self.requirement_groups = {}  # Store requirement groups
        
        if database_path and os.path.exists(database_path):
            self.load_course_database(database_path)
            
        if requirements_json and os.path.exists(requirements_json):
            self.load_requirements(requirements_json)
    
    def load_requirements(self, json_path: str) -> None:
        """
        Load course requirements from JSON file
        
        Args:
            json_path: Path to requirements JSON file
        """
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                requirements = json.load(f)
            
            # Process all courses from requirements
            all_courses = set()
            course_groups = {}
            
            # Extract all courses and their groups
            for category, subcategories in requirements.items():
                if isinstance(subcategories, dict):
                    for subcategory, data in subcategories.items():
                        if isinstance(data, dict) and 'courses' in data:
                            # Direct course list
                            courses = data['courses']
                            all_courses.update(courses)
                            
                            # Store course group
                            group_name = f"{category} - {subcategory}"
                            for course in courses:
                                if course not in course_groups:
                                    course_groups[course] = []
                                course_groups[course].append(group_name)
                                
                        elif isinstance(data, dict) and 'choices' in data:
                            # Choices format
                            for choice_name, choice_data in data['choices'].items():
                                if isinstance(choice_data, list) and len(choice_data) > 1:
                                    # Skip the first element (number required)
                                    choice_courses = choice_data[1:]
                                    all_courses.update(choice_courses)
                                    
                                    # Store course group
                                    group_name = f"{category} - {subcategory} - {choice_name}"
                                    for course in choice_courses:
                                        if course not in course_groups:
                                            course_groups[course] = []
                                        course_groups[course].append(group_name)
                
                elif isinstance(subcategories, list) and len(subcategories) > 1:
                    # Direct list format (like Major Requirements)
                    # Skip the first element (number required)
                    courses = subcategories[1:]
                    all_courses.update(courses)
                    
                    # Store course group
                    for course in courses:
                        if course not in course_groups:
                            course_groups[course] = []
                        course_groups[course].append(category)
            
            # Clean up course IDs
            cleaned_courses = set()
            for course in all_courses:
                if not course:  # Skip empty strings
                    continue
                    
                # Handle special cases like "ElE 235 & ElE 236"
                if '&' in course:
                    parts = [p.strip() for p in course.split('&')]
                    cleaned_courses.update(parts)
                    # Add relationship between these courses
                    for i in range(len(parts)-1):
                        if parts[i+1] not in self.prerequisites:
                            self.prerequisites[parts[i+1]] = []
                        self.prerequisites[parts[i+1]].append(parts[i])
                # Handle alternative courses like "Math 302 | Math 401"
                elif '|' in course:
                    alternatives = [p.strip() for p in course.split('|')]
                    cleaned_courses.update(alternatives)
                    # These are alternative courses (not prerequisites)
                else:
                    cleaned_courses.add(course.strip())
            
            # Store cleaned course data
            for course in cleaned_courses:
                # Standardize course ID format (remove spaces)
                course_id = re.sub(r'\s+', '', course)
                self.all_courses.add(course_id)
                
                # Basic course info
                if course_id not in self.course_data:
                    # Try to extract department and number
                    match = re.match(r'([A-Za-z]+)(\d+[A-Za-z]*)', course_id)
                    if match:
                        dept, num = match.groups()
                        
                        # Determine course level based on course number
                        # This is a crucial change to better infer course levels
                        course_num = int(re.match(r'(\d+)', num).group(1)) if re.match(r'(\d+)', num) else 0
                        
                        # Assign level based on number range
                        if course_num < 200:
                            level_num = 1
                            level = "Introductory"
                        elif course_num < 300:
                            level_num = 2
                            level = "Intermediate"
                        elif course_num < 400:
                            level_num = 3
                            level = "Advanced"
                        else:
                            level_num = 4
                            level = "Senior/Graduate"
                        
                        self.course_data[course_id] = {
                            'name': course,  # Use original format with spaces
                            'field': dept,
                            'number': course_num,
                            'description': f"{level} {dept} course",
                            'level': level_num,
                            'level_name': level,
                            'groups': course_groups.get(course, [])
                        }
                    else:
                        self.course_data[course_id] = {
                            'name': course,
                            'groups': course_groups.get(course, [])
                        }
            
            # Identify course sequences
            self.analyze_requirement_sequences()
            
            print(f"[INFO] Loaded {len(self.all_courses)} courses from requirements")
            
        except Exception as e:
            print(f"[ERROR] Failed to load requirements: {e}")
    
    def analyze_requirement_sequences(self) -> None:
        """Analyze course sequences based on requirements data"""
        # Group courses by department
        departments = defaultdict(list)
        
        for course_id in self.all_courses:
            # Extract department code (letters) and course number
            match = re.match(r'([A-Za-z]+)(\d+[A-Za-z]*)', course_id)
            if match:
                dept, num = match.groups()
                # Convert number to int if possible for proper sorting
                try:
                    # Handle cases like '101A' by removing trailing letters
                    base_num = int(re.match(r'(\d+)', num).group(1))
                    departments[dept].append((course_id, base_num, num))
                except (ValueError, AttributeError):
                    departments[dept].append((course_id, 999, num))  # Default high number for sorting
        
        # Sort courses within each department by number
        for dept, courses in departments.items():
            # Skip if only one course
            if len(courses) <= 1:
                continue
                
            # Sort by the numeric part
            sorted_courses = sorted(courses, key=lambda x: x[1])
            course_ids = [c[0] for c in sorted_courses]
            
            # Store the department sequence
            self.course_sequence_map[dept] = course_ids
            
            # Group courses by field
            self.same_field_courses[dept] = course_ids
            
            # Infer relationships based on course numbers
            # This approach is more flexible than assuming immediate sequence
            for i, (course_id, course_num, _) in enumerate(sorted_courses):
                # For each subsequent course in the sequence
                for j in range(i+1, len(sorted_courses)):
                    next_id, next_num, _ = sorted_courses[j]
                    
                    # Calculate difference in course numbers
                    num_diff = next_num - course_num
                    
                    # Direct prerequisite if numbers are close (e.g., 101 -> 102)
                    if num_diff <= 10:  # Consider courses within 10 numbers as potential direct sequence
                        if next_id not in self.prerequisites:
                            self.prerequisites[next_id] = []
                        if course_id not in self.prerequisites[next_id]:
                            self.prerequisites[next_id].append(course_id)
                    
                    # For larger gaps, consider it a general progression but not direct prerequisite
                    # We could add different relationship types here if needed
    
    def load_course_database(self, database_path: str) -> None:
        """
        Load course database from CSV file
        
        Args:
            database_path: Path to CSV file with course data
        """
        try:
            with open(database_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    course_id = row['course_id']
                    self.all_courses.add(course_id)
                    
                    # Store course data
                    self.course_data[course_id] = {
                        'name': row['course_name'],
                        'credits': row.get('credits', ''),
                        'field': row.get('field', ''),
                        'description': row.get('description', '')
                    }
                    
                    # Store prerequisite relationships
                    if 'prerequisites' in row and row['prerequisites']:
                        prereqs = [p.strip() for p in row['prerequisites'].split(',')]
                        self.prerequisites[course_id] = prereqs
                        
                    # Group courses by field
                    field = row.get('field', '')
                    if field:
                        if field not in self.same_field_courses:
                            self.same_field_courses[field] = []
                        self.same_field_courses[field].append(course_id)
            
            print(f"[INFO] Loaded {len(self.all_courses)} courses from database")
        except Exception as e:
            print(f"[ERROR] Failed to load course database: {e}")
    
    def extract_courses_from_text(self, text: str) -> Set[str]:
        """
        Extract course IDs, descriptions and GPA from transcript text
        
        Args:
            text: OCR-extracted text from transcript
            
        Returns:
            Set of completed course IDs
        """
        # More strict pattern to match course codes
        # This pattern matches real course codes like MATH101, PHYS211, CSCI111
        # The department must be 2-4 letters followed by a 3-digit number
        course_pattern = r'\b([A-Z]{2,4})[- ]?(\d{3}[A-Za-z]?)\b'
        
        # Common false positives to filter out
        false_positives = {
            'FALL', 'USED', 'FRON', 'MMER', 'WWSL', 'AND', 'BOX', 'TO', 'IN', 'OF', 'MS'
        }
        
        # Find all potential course codes
        matches = re.findall(course_pattern, text, re.IGNORECASE)
        
        # Clean up and standardize course codes
        cleaned_courses = set()
        for dept, num in matches:
            # Skip if department is in false positives list
            if dept.upper() in false_positives:
                continue
            
            # Additional validation - typical academic departments
            valid_depts = {'MATH', 'PHYS', 'CHEM', 'BIO', 'BIOL', 'CSCI', 'CS', 'ENGL', 
                          'HIST', 'ECON', 'PSYC', 'SOC', 'PHIL', 'SPAN', 'FR', 'GER', 
                          'CHIN', 'JAPN', 'COMM', 'ANTH', 'POLI', 'GEOG', 'GEOL', 'ART', 
                          'MUS', 'THEA', 'PE', 'EDUC', 'NURS', 'ENGR', 'STAT', 'ASTR',
                          'WRIT', 'SPCH', 'LIBA', 'HON', 'ELE', 'BISC', 'LAT', 'THEA',
                          'ASTRO'}
                          
            # Skip if not a typical academic department
            if dept.upper() not in valid_depts:
                continue
            
            # Remove spaces and join department and number
            course_id = f"{dept}{num}".upper()
            cleaned_courses.add(course_id)
        
        # Update completed courses
        self.completed_courses.update(cleaned_courses)
        
        # Try to extract course descriptions too (for course details)
        self.extract_course_descriptions(text)
        
        # Try to extract GPA
        gpa_info = self.extract_gpa(text)
        if gpa_info:
            print("\nGPA Information:")
            for gpa_type, value in gpa_info.items():
                print(f"  {gpa_type}: {value}")
        
        # Don't print the list of completed courses here
        # We'll handle this in the main function
        return cleaned_courses
    
    def extract_course_descriptions(self, text: str) -> Dict[str, str]:
        """
        Extract course descriptions from transcript text
        
        Args:
            text: OCR-extracted text from transcript
            
        Returns:
            Dictionary mapping course IDs to descriptions
        """
        # We'll store descriptions for courses we've found
        descriptions = {}
        
        # Split into lines for easier processing
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            # Look for course codes in this line
            course_match = re.search(r'([A-Za-z]{2,4})[- ]?(\d{3}[A-Za-z]?)', line, re.IGNORECASE)
            if course_match:
                # Get the standardized course ID
                dept, num = course_match.groups()
                course_id = f"{dept}{num}".upper()
                
                # Look for description in the same line
                # Remove the course code first
                rest_of_line = line[course_match.end():].strip()
                
                # Often course title/description follows the code
                if rest_of_line and len(rest_of_line) > 3:  # Minimal length check
                    # Clean up the description - filter out grade and credits info
                    # This regex tries to find the descriptive part before grade/credit info
                    desc_match = re.match(r'^([^0-9]+)', rest_of_line)
                    if desc_match:
                        description = desc_match.group(1).strip()
                        descriptions[course_id] = description
                        
                        # Update course data if we have this course
                        if course_id in self.course_data:
                            self.course_data[course_id]['description'] = description
                        else:
                            # Create basic course data
                            level_num = int(num[0]) if num[0].isdigit() else 1
                            if level_num < 2:
                                level = "Introductory"
                            elif level_num < 3:
                                level = "Intermediate"
                            elif level_num < 4:
                                level = "Advanced"
                            else:
                                level = "Senior/Graduate"
                                
                            self.course_data[course_id] = {
                                'name': description,
                                'field': dept,
                                'number': int(re.match(r'(\d+)', num).group(1)) if re.match(r'(\d+)', num) else 0,
                                'description': description,
                                'level': level_num,
                                'level_name': level
                            }
        
        return descriptions
    
    def extract_gpa(self, text: str) -> Dict[str, float]:
        """
        Extract GPA information from transcript text
        
        Args:
            text: OCR-extracted text from transcript
            
        Returns:
            Dictionary with GPA information
        """
        gpa_info = {}
        
        # Pattern to match GPA (various formats)
        gpa_patterns = [
            # Pattern for "GPA: X.XX" format
            r'GPA[:\s]+(\d+\.\d+)',
            # Pattern for "X.XX GPA" format
            r'(\d+\.\d+)\s+GPA',
            # Pattern for overall/cumulative GPA
            r'(?:overall|cumulative|cum)[\s\-]*gpa[:\s]+(\d+\.\d+)',
            # Pattern for term/semester GPA
            r'(?:term|semester|sem)[\s\-]*gpa[:\s]+(\d+\.\d+)'
        ]
        
        # Apply each pattern
        for pattern in gpa_patterns:
            matches = re.finditer(pattern, text.lower())
            for match in matches:
                # Get the context to determine GPA type
                line_start = max(0, match.start() - 30)
                line_end = min(len(text), match.end() + 30)
                context = text[line_start:line_end].lower()
                
                gpa_value = float(match.group(1))
                
                # Determine GPA type based on context
                if 'cumulative' in context or 'cum' in context or 'overall' in context:
                    gpa_info['Cumulative GPA'] = gpa_value
                elif 'semester' in context or 'term' in context or 'sem' in context:
                    gpa_info['Semester GPA'] = gpa_value
                elif 'major' in context:
                    gpa_info['Major GPA'] = gpa_value
                else:
                    gpa_info['GPA'] = gpa_value
        
        return gpa_info
    
    def map_to_requirement_courses(self, transcript_courses: Set[str]) -> Dict[str, Set[str]]:
        """
        Map extracted transcript courses to requirement courses
        
        Args:
            transcript_courses: Courses extracted from transcript
            
        Returns:
            Dictionary mapping requirement courses to matched transcript courses
        """
        mapping = {}
        
        # For each requirement course
        for req_course in self.all_courses:
            # Clean up requirement course ID
            clean_req = re.sub(r'\s+', '', req_course).upper()
            
            # Check if this course is in transcript
            for transcript_course in transcript_courses:
                # If course IDs match (ignoring case and spaces)
                if clean_req == transcript_course.upper():
                    if clean_req not in mapping:
                        mapping[clean_req] = set()
                    mapping[clean_req].add(transcript_course)
        
        return mapping
    
    def analyze_course_relationships(self) -> Dict[str, Dict]:
        """
        Analyze relationships between courses
        
        Returns:
            Dictionary with course relationship information
        """
        relationships = {}
        
        # Analyze each course in requirements
        for course_id in self.all_courses:
            # Only include if the course has data
            if course_id not in self.course_data:
                continue
                
            # Get course information
            course_info = self.course_data[course_id]
            is_completed = course_id in self.completed_courses
            
            # Get prerequisites
            prereqs = self.prerequisites.get(course_id, [])
            completed_prereqs = [p for p in prereqs if p in self.completed_courses]
            
            # Get next courses (courses that this is a prerequisite for)
            next_courses = []
            for c, p_list in self.prerequisites.items():
                if course_id in p_list:
                    next_courses.append(c)
            
            # Get related courses (same field/department)
            field = course_info.get('field', '')
            related_courses = []
            if field and field in self.same_field_courses:
                related_courses = [c for c in self.same_field_courses[field] 
                                  if c != course_id]
            
            # Determine course level relation
            level_relation = "Unknown"
            if 'number' in course_info:
                course_num = course_info['number']
                if course_num < 200:
                    level_relation = "Introductory/Fundamental"
                elif course_num < 300:
                    level_relation = "Intermediate/Core"
                elif course_num < 400:
                    level_relation = "Advanced/Specialized"
                else:
                    level_relation = "Senior/Graduate"
            
            # Build relationship info
            relationships[course_id] = {
                'name': course_info.get('name', course_id),
                'field': field,
                'level': course_info.get('level', 0),
                'level_name': course_info.get('level_name', ''),
                'number': course_info.get('number', 0),
                'level_relation': level_relation,
                'description': course_info.get('description', ''),
                'completed': is_completed,
                'prerequisites': {
                    'list': prereqs,
                    'completed': completed_prereqs,
                    'all_completed': set(prereqs).issubset(self.completed_courses) if prereqs else True
                },
                'next_courses': next_courses,
                'related_courses': related_courses,
                'groups': course_info.get('groups', [])
            }
        
        return relationships


def ocr_pdf(pdf_path: str) -> str:
    """
    Extracts and performs OCR on each page of a PDF, focusing on course and GPA information
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Extracted text from the PDF
    """
    print(f"[INFO] Processing PDF: {pdf_path}")
    text_output = ""

    pages = convert_from_path(pdf_path)
    for i, page in enumerate(pages):
        print(f"[INFO] OCR on page {i + 1}/{len(pages)}")
        # Convert PIL Image to NumPy array
        image_np = np.array(page)
        
        # Perform OCR
        result = reader.readtext(image_np)
        
        # Process OCR results to focus on course, description and GPA
        filtered_text = []
        for detection in result:
            text = detection[1]
            
            # Keep text that likely contains course codes or GPA information
            if (re.search(r'([A-Za-z]{2,4})[- ]?(\d{3}[A-Za-z]?)', text) or  # Course code
                re.search(r'GPA', text, re.IGNORECASE) or                     # GPA mention
                re.search(r'\d+\.\d+', text)):                                # Any decimal (potential GPA)
                filtered_text.append(text)
            
            # Also keep longer text (potential course descriptions)
            elif len(text) > 15:  # Arbitrary threshold for descriptions
                filtered_text.append(text)
        
        recognized_text = " ".join(filtered_text)
        text_output += recognized_text + "\n"

    return text_output


def display_course_relationships(relationships: Dict[str, Dict]) -> None:
    """
    Display course relationships in a simplified format, showing only course title and description
    
    Args:
        relationships: Dictionary of course relationships
    """
    print("\n===== COURSES =====\n")
    
    # Group courses by department
    department_courses = defaultdict(list)
    
    for course_id, info in relationships.items():
        if info['field']:
            department_courses[info['field']].append((course_id, info))
    
    # Sort departments alphabetically
    for dept in sorted(department_courses.keys()):
        courses = department_courses[dept]
        
        # Sort courses by number
        sorted_courses = sorted(courses, key=lambda x: x[1].get('number', 0))
        
        print(f"\n== {dept} DEPARTMENT COURSES ==")
        
        # Display courses with simplified information
        for course_id, info in sorted_courses:
            status = "✓" if info['completed'] else "○"
            
            # Course name handling
            course_name = info['name'] if 'name' in info else ""
            
            # Check if course name is just repeating the course ID
            if course_name and isinstance(course_name, str):
                # Extract just the course number part for comparison
                course_id_parts = re.match(r'([A-Za-z]+)(\d+.*)', course_id)
                if course_id_parts:
                    dept_code, course_num = course_id_parts.groups()
                    # Check if course name is just "DEPT NUM" format
                    name_pattern = re.compile(rf'{dept_code}\s*{course_num}', re.IGNORECASE)
                    if name_pattern.fullmatch(course_name.strip()):
                        # Name is just a repetition of the ID, skip it
                        print(f"\n• {status} {course_id}")
                    else:
                        print(f"\n• {status} {course_id}: {course_name}")
                else:
                    print(f"\n• {status} {course_id}: {course_name}")
            else:
                print(f"\n• {status} {course_id}")
            
            # Show course description if available and different from name
            if info.get('description') and info.get('description') != info.get('name'):
                print(f"  Description: {info['description']}")


def search_keyword(text: str, keyword: str) -> List[str]:
    """
    Search for keyword in text and return matching lines with context
    
    Args:
        text: Text to search in
        keyword: Keyword to search for
        
    Returns:
        List of matching lines with context
    """
    lines = text.split('\n')
    matches = []
    
    for i, line in enumerate(lines):
        if keyword.lower() in line.lower():
            # Get context (1 line before and after)
            start = max(0, i-1)
            end = min(len(lines), i+2)
            context = lines[start:end]
            
            # Highlight keyword in the matching line
            for j, ctx_line in enumerate(context):
                if i-start == j:
                    marked = ctx_line.replace(
                        keyword, f">>> {keyword} <<<")
                    context[j] = marked
            
            matches.append('\n'.join(context))
    
    return matches


def save_output_to_file(analyzer, relationships, transcript_text, keyword=None, output_file="transcript_analysis.txt"):
    """
    Save simplified analysis results to a text file
    
    Args:
        analyzer: CourseAnalyzer instance
        relationships: Dictionary of course relationships
        transcript_text: Extracted text from transcript
        keyword: Search keyword (optional)
        output_file: Path to output file
    """
    with open(output_file, 'w', encoding='utf-8') as f:
        # Write header
        f.write("=== TRANSCRIPT ANALYSIS RESULTS ===\n\n")
        
        # Write GPA information if available
        gpa_info = analyzer.extract_gpa(transcript_text)
        if gpa_info:
            f.write("GPA INFORMATION:\n")
            for gpa_type, value in gpa_info.items():
                f.write(f"  {gpa_type}: {value}\n")
            f.write("\n")
        
        # Write course information
        f.write("=== COURSES ===\n\n")
        
        # Group courses by department
        department_courses = defaultdict(list)
        for course_id, info in relationships.items():
            if info['field']:
                department_courses[info['field']].append((course_id, info))
        
        # Write department information
        for dept in sorted(department_courses.keys()):
            courses = department_courses[dept]
            
            # Sort courses by number
            sorted_courses = sorted(courses, key=lambda x: x[1].get('number', 0))
            
            f.write(f"\n== {dept} DEPARTMENT COURSES ==\n")
            
            # Write course information with simplified format
            for course_id, info in sorted_courses:
                status = "✓" if info['completed'] else "○"
                
                # Course name handling
                course_name = info['name'] if 'name' in info else ""
                
                # Check if course name is just repeating the course ID
                if course_name and isinstance(course_name, str):
                    # Extract just the course number part for comparison
                    course_id_parts = re.match(r'([A-Za-z]+)(\d+.*)', course_id)
                    if course_id_parts:
                        dept_code, course_num = course_id_parts.groups()
                        # Check if course name is just "DEPT NUM" format
                        name_pattern = re.compile(rf'{dept_code}\s*{course_num}', re.IGNORECASE)
                        if name_pattern.fullmatch(course_name.strip()):
                            # Name is just a repetition of the ID, skip it
                            f.write(f"\n• {status} {course_id}\n")
                        else:
                            f.write(f"\n• {status} {course_id}: {course_name}\n")
                    else:
                        f.write(f"\n• {status} {course_id}: {course_name}\n")
                else:
                    f.write(f"\n• {status} {course_id}\n")
                
                # Show course description if available and different from name
                if info.get('description') and info.get('description') != info.get('name'):
                    f.write(f"  Description: {info['description']}\n")
        
        # Write keyword search results if applicable
        if keyword:
            matches = search_keyword(transcript_text, keyword)
            if matches:
                f.write(f"\n\n=== SEARCH RESULTS FOR '{keyword}' ===\n\n")
                for i, match in enumerate(matches, 1):
                    f.write(f"Match {i}:\n")
                    f.write(f"{match}\n")
                    f.write("-" * 50 + "\n")
            else:
                f.write(f"\nNo matches found for '{keyword}'\n")
    
    print(f"[INFO] Analysis results saved to {output_file}")


def main():
    parser = argparse.ArgumentParser(description="Transcript analyzer focusing on courses and GPA")
    parser.add_argument('-i', '--pdf', type=str, help="Path to transcript PDF file")
    parser.add_argument('-r', '--requirements', type=str, default="./json/requirementsDB.json",
                        help="Path to requirements JSON file")
    parser.add_argument('-kw', '--keyword', type=str, help="Search for specific keyword in transcript")
    parser.add_argument('-o', '--output', type=str, default="transcript_analysis.txt",
                        help="Output file for saving analysis results")
    args = parser.parse_args()

    # Check if PDF file exists
    if not args.pdf:
        print("Please specify a transcript PDF file with -i/--pdf")
        return
        
    if not os.path.exists(args.pdf):
        print(f"[ERROR] PDF file not found: {args.pdf}")
        return
    
    # Check for requirements file, try different paths
    requirements_path = args.requirements
    if not os.path.exists(requirements_path):
        # Try relative path from current directory
        requirements_path = os.path.join(".", "json", "requirementsDB.json")
        if not os.path.exists(requirements_path):
            # Try relative path from parent directory
            requirements_path = os.path.join("..", "json", "requirementsDB.json")
            if not os.path.exists(requirements_path):
                print(f"[WARNING] Requirements file not found. Course relations may be limited.")
                requirements_path = None
    
    # Extract text from PDF, focusing on relevant information
    transcript_text = ocr_pdf(args.pdf)
    
    # Initialize course analyzer with requirements
    analyzer = CourseAnalyzer(requirements_json=requirements_path)
    
    # Extract courses from transcript
    completed_courses = analyzer.extract_courses_from_text(transcript_text)
    
    # Analyze course relationships
    relationships = analyzer.analyze_course_relationships()
    
    # Display course relationships in console
    display_course_relationships(relationships)
    
    # Save results to file
    save_output_to_file(analyzer, relationships, transcript_text, args.keyword, args.output)
    
    # If keyword is provided, search for it in the transcript and show in console
    if args.keyword:
        print(f"\n[INFO] Searching for keyword: '{args.keyword}'")
        matches = search_keyword(transcript_text, args.keyword)
        
        if matches:
            print(f"\n===== FOUND {len(matches)} MATCHES FOR '{args.keyword}' =====\n")
            for i, match in enumerate(matches, 1):
                print(f"Match {i}:")
                print(match)
                print("-" * 50)
        else:
            print(f"\n[INFO] No matches found for '{args.keyword}'")


if __name__ == "__main__":
    main() 