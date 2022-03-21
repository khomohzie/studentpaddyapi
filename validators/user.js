exports.profileSetupValidator = (req, res, next) => {
	const data = JSON.parse(req.body.data);

	const {
		firstname,
		lastname,
		academic_status,
		institution,
		faculty,
		department,
		year_of_graduation,
	} = data;

	if (!firstname || firstname.length === 0) {
		return res.status(422).json({ error: "Firstname should not be empty" });
	}

	if (!lastname || lastname.length === 0) {
		return res.status(422).json({ error: "Lastname should not be empty" });
	}

	if (!academic_status || academic_status.length === 0) {
		return res
			.status(422)
			.json({ error: "Academic status should not be empty" });
	}

	if (!institution || institution.length === 0) {
		return res
			.status(422)
			.json({ error: "Institution should not be empty" });
	}

	if (!faculty || faculty.length === 0) {
		return res.status(422).json({ error: "Faculty should not be empty" });
	}

	if (!department || department.length === 0) {
		return res
			.status(422)
			.json({ error: "Department should not be empty" });
	}

	if (!year_of_graduation || year_of_graduation.length === 0) {
		return res
			.status(422)
			.json({ error: "Graduation year should not be empty" });
	}

	next();
};
