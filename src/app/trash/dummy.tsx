{form && (
        <div className={styles.card}>
          <h2>Edit Request</h2>
          <div className={styles.formGrid}>
            {/* row 1 */}
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="Title"
            />
            <input
              name="company"
              value={form.company}
              onChange={onChange}
              placeholder="Company"
            />

            {/* row 2 */}
            <input
              name="city"
              value={form.city}
              onChange={onChange}
              placeholder="City"
            />
            <input
              name="country"
              value={form.country}
              onChange={onChange}
              placeholder="Country"
            />

            {/* row 3 */}
            <select name="officeType" value={form.officeType} onChange={onChange}>
              <option value="" disabled>
                Location Type (Select one)
              </option>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>In-Office</option>
              <option>Remote-Anywhere</option>
            </select>

            <select
              name="experienceLevel"
              value={form.experienceLevel}
              onChange={onChange}
            >
              <option value="" disabled>
                Select Experience Level
              </option>
              <option>Intern</option>
              <option>Entry-level</option>
              <option>Associate/Mid-level</option>
              <option>Senior-level</option>
              <option>Managerial</option>
              <option>Executive</option>
            </select>

            <select
              name="employmentType"
              value={form.employmentType}
              onChange={onChange}
            >
              <option value="" disabled>
                Select Employment Type
              </option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Temporary</option>
              <option>Freelance</option>
            </select>

            {/* industries */}
            <div className={styles.fullWidth}>
              <p className={styles.label}>Industry (up to 3):</p>
              <div className={styles.checkboxGroup}>
                {industryOptions.map((opt) => (
                  <label key={opt}>
                    <input
                      type="checkbox"
                      checked={form.industries.includes(opt)}
                      onChange={() => toggleArr("industries", opt)}
                    />{" "}
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* visa */}
            <label className={styles.fullWidth}>
              <input
                type="checkbox"
                name="visa"
                checked={form.visa}
                onChange={onChange}
              />{" "}
              Visa Sponsorship Available
            </label>

            {/* benefits */}
            <div className={styles.fullWidth}>
              <p className={styles.label}>Benefits:</p>
              <div className={styles.checkboxGroup}>
                {benefitOptions.map((b) => (
                  <label key={b}>
                    <input
                      type="checkbox"
                      checked={form.benefits.includes(b)}
                      onChange={() => toggleArr("benefits", b)}
                    />{" "}
                    {b}
                  </label>
                ))}
              </div>
            </div>

            {/* skills & url */}
            <input
              className={styles.fullWidth}
              placeholder="Skills (comma-separated)"
              value={form.skills.join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
                  skills: e.target.value.split(",").map((s) => s.trim()),
                } as TrashItem)
              }
            />
            <input
              className={styles.fullWidth}
              placeholder="Application URL"
              name="url"
              value={form.url}
              onChange={onChange}
            />

            {/* currency & salary */}
            <select name="currency" value={form.currency} onChange={onChange}>
              <option value="" disabled>
                Choose currency
              </option>
              {currencyOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <div className={styles.salaryRow}>
              <input
                name="salaryLow"
                placeholder="Low"
                value={String(form.salaryLow)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    salaryLow: parseInt(e.target.value) || 0,
                  } as TrashItem)
                }
              />
              <span>–</span>
              <input
                name="salaryHigh"
                placeholder="High"
                value={String(form.salaryHigh)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    salaryHigh: parseInt(e.target.value) || 0,
                  } as TrashItem)
                }
              />
            </div>

            {/* job/internship */}
            <select
              className={styles.fullWidth}
              name="type"
              value={form.type}
              onChange={onChange}
            >
              <option value="" disabled>
                Choose opportunity type
              </option>
              <option value="job">Job</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          {/* save / cancel */}
          <div className={styles.editActions}>
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={saveEdit}
              disabled={loadingId === editingId}
            >
              Save Changes
            </button>
            <button
              className={`${styles.button} ${styles.delete}`}
              onClick={cancelEdit}
              disabled={loadingId === editingId}
            >
              Cancel
            </button>
          </div>
        </div>
      )}