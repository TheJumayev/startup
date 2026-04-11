-- Noto'g'ri foreign key ni o'chirish (students jadvaliga yo'naltiruvchi)
ALTER TABLE lesson DROP CONSTRAINT IF EXISTS fkkj2dey1bkkv8ofa27ec2jp8te;

-- To'g'ri foreign key yaratish (curriculm jadvaliga)
ALTER TABLE lesson
    ADD CONSTRAINT fk_lesson_curriculm
    FOREIGN KEY (curriculm_id) REFERENCES curriculm(id);

