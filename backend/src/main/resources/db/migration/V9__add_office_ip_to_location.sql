ALTER TABLE office_location ADD COLUMN office_ip VARCHAR(45) NULL;
UPDATE office_location SET office_ip = '192.168.10.109' WHERE id = 'loc-default-id-0000000000000000000';
