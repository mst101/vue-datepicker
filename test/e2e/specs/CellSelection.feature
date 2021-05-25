Feature: Cell Selection
  As a user
  I want to select a cell
  So that I pick a date


  @id-1
  Scenario Outline: Select by <action>: minimum view
    Given the calendar is open with a "<view>" view
    When the user performs a "<action>" action
    Then the date is submitted
    And the input field has focus

    Examples:
      | # | view | action |
      | 1 | day  | click  |
      | 2 | day  | enter  |
      | 3 | day  | space  |


  @id-2
  Scenario Outline: Select by <action>: NOT minimum view
    Given the calendar is open with a "<view>" view
    When the user performs a "<action>" action
    Then the `day` view is shown
    And the tabbable cell has focus

    Examples:
      | # | view  | action |
      | 1 | month | click  |
      | 2 | month | enter  |
      | 3 | month | space  |
