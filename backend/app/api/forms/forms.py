from wtforms import StringField, DateField, DecimalField, IntegerField, TextAreaField, SelectField, FloatField, Form, FieldList, FormField
from wtforms.validators import DataRequired, Optional, Length, NumberRange

class FloorForm(Form):
    number = StringField('Number', validators=[DataRequired(), Length(max=64)])

class BlockForm(Form):
    name = StringField('Name', validators=[DataRequired(), Length(max=64)])
    floors = FieldList(FormField(FloorForm), min_entries=1)

class ObjectForm(Form):
    name = StringField('Name', validators=[DataRequired(), Length(max=255)])

class ProjectForm(Form):
    code = StringField('Code', validators=[DataRequired()])
    icon = StringField('Icon', validators=[Optional()])
    name = StringField('Name', validators=[DataRequired()])
    description = StringField('Description', validators=[Optional()])
    client = StringField('Client', validators=[Optional()])
    contractor = StringField('Contractor', validators=[Optional()])
    address = StringField('Address', validators=[Optional()])
    start_date = DateField('Start Date', format='%Y-%m-%d', validators=[Optional()])
    end_date = DateField('End Date', format='%Y-%m-%d', validators=[Optional()])
    budget = FloatField('Budget', validators=[Optional()])

class WorkTypeForm(Form):
    name = StringField('Name', validators=[DataRequired(), Length(max=255)])
    order = IntegerField('Order', validators=[DataRequired(), NumberRange(min=1)])
    color = StringField('Color', validators=[DataRequired(), Length(max=64)])
    category = StringField('Category', validators=[DataRequired(), Length(max=255)])

class ExecutorForm(Form):
    name = StringField('Name', validators=[DataRequired(), Length(max=255)])

class WorkForm(Form):
    executor_id = IntegerField('Executor ID', validators=[DataRequired()])
    work_type_id = IntegerField('Work Type ID', validators=[DataRequired()])
    start_date = DateField('Start Date', format='%Y-%m-%d', validators=[DataRequired()])
    end_date = DateField('End Date', format='%Y-%m-%d', validators=[DataRequired()])
    status = SelectField('Status', choices=[('not-started', 'Not Started'), ('in-progress', 'In Progress'), ('completed', 'Completed'), ('overdue', 'Overdue')], validators=[DataRequired()])
    priority = StringField('Priority', validators=[DataRequired()])
    progress = IntegerField('Progress', validators=[NumberRange(min=0, max=100)])
    note = TextAreaField('Note', validators=[Optional()])
    floor_id = IntegerField('Floor ID', validators=[DataRequired()])
    object_id = IntegerField('Object ID', validators=[DataRequired()])