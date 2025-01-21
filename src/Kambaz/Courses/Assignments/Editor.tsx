export default function AssignmentEditor() {
    return (
      <div id="wd-assignments-editor">
        <label htmlFor="wd-name">Assignment Name</label>
        <input id="wd-name" value="A1 - ENV + HTML" /><br /><br />
        <textarea id="wd-description">
          The assignment is available online Submit a link to the landing page of
        </textarea>
        <br />
        <table>
        <tr>
          <td align="right" valign="top">
            <label htmlFor="wd-points">Points</label>
          </td>
          <td>
            <input id="wd-points" value={100} />
          </td>
        </tr>
        <tr>
                    <td align="right" valign="top">
                        <label htmlFor="wd-group">Assigment Group</label>
                    </td>
                    <td>
                        <select id="wd-group">
                            <option>ASSIGNMENTS</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td align="right" valign="top">
                        <label htmlFor="wd-display-grade-as">Display Grade as</label>
                    </td>
                    <td>
                        <select id="wd-display-grade-as">
                            <option>Percentage</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td align="right" valign="top">
                        <label htmlFor="wd-submission-type">Submission Type</label>
                    </td>
                    <td>
                        <select id="wd-submission-type">
                            <option>Online</option>
                        </select>
                        <br />
                        <br />
                        Online Entry Options
                        <br />
                        <input id="wd-text-entry" type="checkbox" />
                        <label htmlFor="wd-text-entry">Text Entry</label>
                        <br />
                        <input id="wd-website-url" type="checkbox" />
                        <label htmlFor="wd-website-url">Website URL</label>
                        <br />
                        <input id="wd-media-recordings" type="checkbox" />
                        <label htmlFor="wd-media-recordings">Media Recordings</label>
                        <br />
                        <input id="wd-student-annotation" type="checkbox" />
                        <label htmlFor="wd-student-annotation">Student Annotation</label>
                        <br />
                        <input id="wd-file-upload" type="checkbox" />
                        <label htmlFor="wd-file-upload">File Uploads</label>
                    </td>
                </tr>
                <tr>
                    <td align="right" valign="top">
                        <label htmlFor="wd-assign-to">Assign</label>
                    </td>
                    <td>
                        Assign to
                        <br />
                        <input id="wd-assign-to" value="Everyone" />
                        <br /> <br />
                        Due
                        <br />
                        <input id="wd-due-date" type="date" value="2024-05-13" />
                        <br />
                        <br />
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td>Available from</td>
                    <td>Until</td>
                </tr>
                <tr>
                    <td></td>
                    <td><input id="wd-available-from" type="date" value="2024-05-06" /></td>
                    <td><input id="wd-available-until" type="date" value="2024-05-20" /></td>
                </tr>
                <br />
                <tr>
                    <td></td>
                    <td></td>
                    <button>Cancel</button>  <button>Save</button>
                </tr>
      </table>
    </div>
);}
  