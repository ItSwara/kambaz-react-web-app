export default function AssignmentEditor() {
    return (
        <div id="wd-assignments-editor">
            <form action="#" className="assignment-editor" style={{ maxWidth: "600px", margin: "0 auto" }}>
                <label htmlFor="wd-name" className="mb-2">
                    <b>Assignment Name</b>
                </label>
                <br />
                <input id="wd-name" className="form-control" defaultValue="A1" />
                <br />
                <textarea id="wd-description" rows={10} className="form-control">
                    The assignment is available online.

                    Submit a link to the landing page of your Web application running on Netlify.
                    The landing page should include the following:
                    - Your full name and section
                    - Links to each of the lab assignments
                    - Link to the Kanbas application
                    - Links to all relevant source code repositories.

                    The Kanbas application should include a link to navigate back to the landing page.
                </textarea>
                <br />
                <table className="table">
                    <tbody>
                        <tr>
                            <td align="right" valign="top">
                                <label htmlFor="wd-points">Points</label>
                            </td>
                            <td>
                                <input id="wd-points" className="form-control" defaultValue={100} />
                            </td>
                        </tr>
                        <tr>
                            <td align="right" valign="top">
                                <label htmlFor="wd-group">Assignment Group</label>
                            </td>
                            <td>
                                <select id="wd-group" className="form-control">
                                    <option>ASSIGNMENTS</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td align="right" valign="top">
                                <label htmlFor="wd-display-grade-as">Display Grade as</label>
                            </td>
                            <td>
                                <select id="wd-display-grade-as" className="form-control">
                                    <option>Percentage</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td align="right" valign="top">
                                <label htmlFor="wd-submission-type">Submission Type</label>
                            </td>
                            <td className="border p-3">
                                <select id="wd-select-submission-type" className="form-select">
                                    <option selected value="Online">Online</option>
                                    <option value="In-person">In-person</option>
                                </select>
                                <p></p>
                                <div id="wd-online-options">
                                    <label>Online Entry Options:</label><br />
                                    <div className="form-check">
                                        <input type="checkbox" name="check-online-options" id="wd-chkbox-text" className="form-check-input" />
                                        <label htmlFor="wd-chkbox-text" className="form-check-label"> Text Entry</label>
                                    </div>
                                    <div className="form-check">
                                        <input type="checkbox" name="check-online-options" id="wd-chkbox-website" className="form-check-input" />
                                        <label htmlFor="wd-chkbox-website" className="form-check-label">  Website URL</label>
                                    </div>

                                    <div className="form-check">
                                        <input type="checkbox" name="check-online-options" id="wd-chkbox-recordings" className="form-check-input" />
                                        <label htmlFor="wd-chkbox-recordings" className="form-check-label"> Media Recordings</label>
                                    </div>

                                    <div className="form-check">
                                        <input type="checkbox" name="check-online-options" id="wd-chkbox-annotations" className="form-check-input" />
                                        <label htmlFor="wd-chkbox-annotations" className="form-check-label">
                                            Student Annotations
                                        </label>
                                    </div>

                                    <div className="form-check">
                                        <input type="checkbox" name="check-online-options" id="wd-chkbox-uploads" className="form-check-input" />
                                        <label htmlFor="wd-chkbox-uploads" className="form-check-label"> File Uploads</label>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td align="right" valign="top">
                                <label htmlFor="wd-assign-to">Assign</label>
                            </td>
                            <td className="border p-3">
                                Assign to
                                <br />
                                <input id="wd-assign-to" className="form-control" defaultValue="Everyone" />
                                <br />
                                Due
                                <br />
                                <input id="wd-due-date" type="date" className="form-control" defaultValue="2024-05-13" />
                                <br />
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td >Available from</td>
                            <td>Until</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td><input id="wd-available-from" type="date" className="form-control" defaultValue="2024-05-06" /></td>
                            <td><input id="wd-available-until" type="date" className="form-control" defaultValue="2024-05-20" /></td>
                        </tr>
                        <tr>
                            <td colSpan={2} align="right">
                                <td><button className="btn btn-secondary me-2" id="wd-cancel">
                                    Cancel
                                </button> </td>
                                <td><button className="btn" 
                                            id="wd-save"
                                            style={{
                                            backgroundColor: "#dc3545",
                                            color: "white",
                                            borderColor: "#dc3545"
                                                    }}>
                                    Save
                                </button></td>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
}